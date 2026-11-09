import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';

export interface UploadedImage {
  id: number;
  fileName: string;
  contentType: string;
  imageUrl: string;
}

@Injectable({ providedIn: 'root' })
export class ImageService {
  constructor(private readonly http: HttpClient) {}

  upload(file: File): Observable<UploadedImage> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<UploadedImage>(`${environment.apiBaseUrl}/images`, form);
  }

  imageSource(path?: string): string {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;

    // Accept API-relative URLs and older values saved with an /api prefix.
    const normalizedPath = path.replace(/^\/api(?=\/)/i, '');
    const suffix = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
    return `${environment.apiBaseUrl}${suffix}`;
  }
}
