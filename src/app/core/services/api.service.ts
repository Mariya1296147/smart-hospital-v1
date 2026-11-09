import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  readonly baseUrl = environment.apiBaseUrl;

  constructor(protected readonly http: HttpClient) {}

  protected endpoint(resource: string): string {
    return `${this.baseUrl}/${resource}`;
  }

  getResource<T>(resource: string): Observable<T> {
    return this.http.get<T>(this.endpoint(resource));
  }

  getAll<T>(resource: string): Observable<T[]> {
    return this.http.get<T[]>(this.endpoint(resource)).pipe(
      map(items => (items ?? []).map(item => this.normalize(resource, item)))
    );
  }

  getById<T>(resource: string, id: number | string): Observable<T> {
    return this.http.get<T>(`${this.endpoint(resource)}/${encodeURIComponent(id)}`).pipe(
      map(item => this.normalize(resource, item))
    );
  }

  create<T, B = Partial<T>>(resource: string, body: B): Observable<T> {
    return this.resolvePayload(resource, body).pipe(
      switchMap(payload => {
        if (this.resourceKey(resource) === 'appointments') delete payload.patientPhone;
        return this.http.post<T>(this.endpoint(resource), payload);
      }),
      map(item => this.normalize(resource, item))
    );
  }

  createText<B>(resource: string, body: B): Observable<string> {
    return this.http.post(this.endpoint(resource), body, { responseType: 'text' });
  }

  update<T, B = Partial<T>>(resource: string, id: number | string, body: B): Observable<T> {
    const payloadRequest = this.resourceKey(resource) === 'appointments'
      ? of(this.prepareAppointmentUpdate(body))
      : this.resolvePayload(resource, body);
    return payloadRequest.pipe(
      switchMap(payload => this.http.put<T>(`${this.endpoint(resource)}/${encodeURIComponent(id)}`, payload)),
      map(item => this.normalize(resource, item))
    );
  }
  patch<T>(
  resource: string,
  path: string,
  body?: unknown
): Observable<T> {
  return this.http.patch<T>(
    `${this.endpoint(resource)}/${path}`,
    body ?? null
  );
}

  remove(resource: string, id: number | string): Observable<void> {
    return this.http.delete(`${this.endpoint(resource)}/${encodeURIComponent(id)}`, {
      responseType: 'text'
    }).pipe(map(() => undefined));
  }

  private resolvePayload(resource: string, body: unknown): Observable<any> {
    const key = this.resourceKey(resource);
    const links: Record<string, Array<{ endpoint: string; property: string; idFields: string[]; labelFields: string[]; legacyField?: string; required?: boolean }>> = {
      doctors: [{ endpoint: 'departments', property: 'department', idFields: ['departmentId'], labelFields: ['departmentName', 'department'], required: false }],
      nurses: [
        { endpoint: 'departments', property: 'department', idFields: ['departmentId'], labelFields: ['departmentName', 'department'], required: false },
        { endpoint: 'wards', property: 'wardRef', idFields: ['wardId'], labelFields: ['wardName', 'ward'], legacyField: 'ward', required: false }
      ],
      billings: [
        { endpoint: 'patients', property: 'patient', idFields: ['patientId'], labelFields: ['patientName', 'patient'], required: true },
        { endpoint: 'doctors', property: 'doctor', idFields: ['doctorId'], labelFields: ['doctorName', 'doctor'], required: false },
        { endpoint: 'departments', property: 'department', idFields: ['departmentId'], labelFields: ['departmentName', 'department'], required: false },
        { endpoint: 'appointments', property: 'appointment', idFields: ['appointmentId'], labelFields: ['appointmentCode'], required: false }
      ],
      consultations: [
        { endpoint: 'patients', property: 'patient', idFields: ['patientId'], labelFields: ['patientName', 'patient'], required: true },
        { endpoint: 'doctors', property: 'doctor', idFields: ['doctorId'], labelFields: ['doctorName', 'doctor'], required: true },
        { endpoint: 'departments', property: 'department', idFields: ['departmentId'], labelFields: ['departmentName', 'department'], required: false }
      ],
      prescriptions: [
        { endpoint: 'patients', property: 'patient', idFields: ['patientId'], labelFields: ['patientName', 'patient'], required: true },
        { endpoint: 'doctors', property: 'doctor', idFields: ['doctorId'], labelFields: ['doctorName', 'doctor'], required: true },
        { endpoint: 'departments', property: 'department', idFields: ['departmentId'], labelFields: ['departmentName', 'department'], required: false }
      ],
      laboratories: [
        { endpoint: 'patients', property: 'patient', idFields: ['patientId'], labelFields: ['patientName', 'patient'], required: true },
        { endpoint: 'doctors', property: 'doctor', idFields: ['doctorId'], labelFields: ['doctorName', 'doctor'], required: false },
        { endpoint: 'departments', property: 'department', idFields: ['departmentId'], labelFields: ['departmentName', 'department'], required: false }
      ],
      discharges: [
        { endpoint: 'patients', property: 'patient', idFields: ['patientId'], labelFields: ['patientName', 'patient'], required: true },
        { endpoint: 'doctors', property: 'doctor', idFields: ['doctorId'], labelFields: ['doctorName', 'doctor'], required: false },
        { endpoint: 'departments', property: 'department', idFields: ['departmentId'], labelFields: ['departmentName', 'department'], required: false }
      ]
    };
    const entity = body && typeof body === 'object' ? { ...(body as Record<string, any>) } : {};
    if (key === 'prescriptions' && entity['age'] == null && entity['patientAge'] != null) {
      entity['age'] = entity['patientAge'];
    }
    if (key === 'prescriptions') delete entity['patientAge'];
    const relationLinks = links[key] ?? [];
    const needed = [...new Set(relationLinks
      .filter(link => this.hasRelationInput(entity, link)
        && !(entity[link.property] && typeof entity[link.property] === 'object' && entity[link.property].id != null)
        && !link.idFields.some(field => entity[field] !== undefined && entity[field] !== null && entity[field] !== '' && Number.isFinite(Number(entity[field]))))
      .map(link => link.endpoint))];
    if (!needed.length) return of(entity);

    const requests: Record<string, Observable<any[]>> = {};
    for (const endpoint of needed) requests[endpoint] = this.http.get<any[]>(this.endpoint(endpoint));
    return forkJoin(requests).pipe(map(referenceData => {
      for (const link of relationLinks) {
        if (!this.hasRelationInput(entity, link)) continue;
        const current = entity[link.property];
        if (current && typeof current === 'object' && current.id != null) {
          entity[link.property] = { id: current.id };
          continue;
        }
        const directId = link.idFields.map(field => entity[field]).find(value => value !== undefined && value !== null && value !== '' && Number.isFinite(Number(value)));
        if (directId !== undefined) {
          entity[link.property] = { id: Number(directId) };
          continue;
        }
        const values = referenceData[link.endpoint] ?? [];
        const idCandidate = link.idFields.map(field => entity[field]).find(value => value !== undefined && value !== null && value !== '');
        const labelCandidate = link.labelFields.map(field => entity[field]).find(value => typeof value === 'string' && value.trim() !== '');
        const candidate = idCandidate ?? labelCandidate;
        const match = values.find(item => [item.id, item.patientId, item.doctorId, item.departmentName, item.wardName, item.bedNumber, item.name]
          .some(value => value != null && String(value).toLowerCase() === String(candidate).trim().toLowerCase()));
        if (!match) throw new Error(`Could not match ${link.property} to a hospital record. Select a valid record and try again.`);
        entity[link.property] = { id: match.id };
        if (link.legacyField) entity[link.legacyField] = match.wardName ?? labelCandidate;
      }
      for (const field of [
        'patientId', 'patientName', 'patientPhone', 'doctorId', 'doctorName',
        'departmentId', 'departmentName', 'wardId'
      ]) delete entity[field];
      if (key === 'billings') delete entity['appointmentId'];
      if (key === 'consultations') delete entity['patientAge'];
      if (key === 'consultations' && entity['status'] != null) {
        entity['status'] = String(entity['status']).toUpperCase();
      }
      if (key === 'discharges') delete entity['status'];
      if (key === 'discharges' && entity['admissionId'] != null && entity['admissionId'] !== '') {
        entity['admission'] = { id: Number(entity['admissionId']) };
        delete entity['admissionId'];
      }
      return entity;
    }));
  }

  private prepareAppointmentUpdate(body: unknown): Record<string, any> {
    const entity = body && typeof body === 'object' ? { ...(body as Record<string, any>) } : {};
    for (const [idField, relation] of [['patientId', 'patient'], ['doctorId', 'doctor'], ['departmentId', 'department']]) {
      const id = entity[idField];
      if (id != null && id !== '') entity[relation] = { id: Number(id) };
      delete entity[idField];
    }
    delete entity['patientPhone'];
    return entity;
  }

  private hasRelationInput(entity: Record<string, any>, link: { property: string; idFields: string[]; labelFields: string[] }): boolean {
    return (entity[link.property] !== undefined && entity[link.property] !== null && entity[link.property] !== '')
      || link.idFields.some(field => entity[field] !== undefined && entity[field] !== null && entity[field] !== '')
      || link.labelFields.some(field => typeof entity[field] === 'string' && entity[field].trim() !== '');
  }

  private resourceKey(resource: string): string {
    return resource.split(/[/?]/, 1)[0].toLowerCase();
  }

  private normalize(resource: string, value: any): any {
    if (!value || typeof value !== 'object') return value;
    const key = this.resourceKey(resource);
    const department = typeof value.department === 'string'
      ? value.department : value.department?.departmentName ?? '';
    const patient = value.patient;
    const doctor = value.doctor;
    switch (key) {
      case 'appointments':
        return { ...value, patientName: value.patientName ?? patient?.name ?? '', patientPhone: value.patientPhone ?? patient?.phone ?? '', doctorName: value.doctorName ?? doctor?.name ?? '', department: department || doctor?.department?.departmentName || '' };
      case 'billings':
        return { ...value, patientName: value.patientName ?? patient?.name ?? '', patientId: value.patientId ?? patient?.patientId ?? '', patientPhone: value.patientPhone ?? patient?.phone ?? '', doctor: typeof doctor === 'string' ? doctor : doctor?.name ?? '', department: department || doctor?.department?.departmentName || '' };
      case 'consultations':
      case 'prescriptions':
        return { ...value, patientName: value.patientName ?? patient?.name ?? '', patientId: value.patientId ?? patient?.patientId ?? '', doctorName: value.doctorName ?? doctor?.name ?? '', department: department || doctor?.department?.departmentName || '', status: value.status ? String(value.status).toLowerCase().replace(/^./, (letter: string) => letter.toUpperCase()) : value.status };
      case 'laboratories':
        return { ...value, patientName: value.patientName ?? patient?.name ?? '', patientId: value.patientId ?? patient?.patientId ?? '', doctor: typeof doctor === 'string' ? doctor : doctor?.name ?? '', department: department || doctor?.department?.departmentName || '' };
      case 'discharges':
        return { ...value, patientName: value.patientName ?? patient?.name ?? '', patientId: value.patientId ?? patient?.patientId ?? '', doctorName: value.doctorName ?? doctor?.name ?? '', department, status: value.status ?? 'Discharged' };
      case 'doctors':
        return { ...value, department };
      case 'nurses':
        return { ...value, department, ward: value.ward ?? value.wardRef?.wardName ?? '' };
      default:
        return value;
    }
  }
}
