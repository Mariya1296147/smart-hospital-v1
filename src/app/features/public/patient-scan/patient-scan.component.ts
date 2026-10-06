import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../../core/services/patient.service';

interface BarcodeDetectorLike {
  detect(source: HTMLVideoElement): Promise<Array<{ rawValue: string }>>;
}

interface BarcodeDetectorConstructor {
  new (options: { formats: string[] }): BarcodeDetectorLike;
}

@Component({
  selector: 'app-patient-scan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-scan.component.html',
  styleUrl: './patient-scan.component.css'
})
export class PatientScanComponent implements OnDestroy {

  @ViewChild('cameraFeed') cameraFeed?: ElementRef<HTMLVideoElement>;

  patientId = '';
  message = '';
  messageType: 'success' | 'error' | 'info' = 'info';
  scannerActive = false;
  scannerStarting = false;

  private cameraStream?: MediaStream;
  private scanTimer?: ReturnType<typeof setTimeout>;
  private detector?: BarcodeDetectorLike;

  constructor(private patientService: PatientService) {}

  searchPatient(): void {
    const id = this.patientId.trim();

    if (!id) {
      this.setMessage('Please enter your Patient ID.', 'error');
      return;
    }

    this.handlePatientCode(id);
  }

  async startScanner(): Promise<void> {
    if (this.scannerActive || this.scannerStarting) return;

    const detectorConstructor = (
      window as Window & { BarcodeDetector?: BarcodeDetectorConstructor }
    ).BarcodeDetector;

    if (!detectorConstructor) {
      this.setMessage(
        'QR scanning is not supported by this browser. Enter the Patient ID below instead.',
        'info'
      );
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      this.setMessage(
        'Camera access is unavailable. Enter the Patient ID below instead.',
        'error'
      );
      return;
    }

    this.scannerStarting = true;
    try {
      this.detector = new detectorConstructor({ formats: ['qr_code'] });
      this.cameraStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' } }
      });
      this.scannerActive = true;
      this.message = '';

      const video = this.cameraFeed?.nativeElement;
      if (!video) {
        throw new Error('Camera preview is not available.');
      }

      video.srcObject = this.cameraStream;
      await video.play();
      this.scanForCode();
    } catch (error) {
      this.stopScanner();
      const message = error instanceof Error
        ? error.message
        : 'Unable to start the camera.';
      this.setMessage(`${message} Check camera permission or enter the Patient ID below.`, 'error');
    } finally {
      this.scannerStarting = false;
    }
  }

  stopScanner(): void {
    if (this.scanTimer) {
      clearTimeout(this.scanTimer);
      this.scanTimer = undefined;
    }

    this.cameraStream?.getTracks().forEach(track => track.stop());
    this.cameraStream = undefined;
    if (this.cameraFeed) {
      this.cameraFeed.nativeElement.srcObject = null;
    }
    this.scannerActive = false;
    this.scannerStarting = false;
  }

  ngOnDestroy(): void {
    this.stopScanner();
  }

  private async scanForCode(): Promise<void> {
    const video = this.cameraFeed?.nativeElement;
    if (!this.scannerActive || !video || !this.detector) return;

    try {
      const codes = await this.detector.detect(video);
      const patientCode = codes[0]?.rawValue;
      if (patientCode) {
        this.stopScanner();
        this.handlePatientCode(patientCode);
        return;
      }
    } catch {
      this.stopScanner();
      this.setMessage('Unable to read this QR code. Please enter the Patient ID manually.', 'error');
      return;
    }

    this.scanTimer = setTimeout(() => void this.scanForCode(), 300);
  }

  private handlePatientCode(value: string): void {
    const code = this.extractPatientId(value);
    const patient = code
      ? this.patientService.getPatients().find(
          item => item.patientId.toLowerCase() === code.toLowerCase()
        )
      : undefined;

    if (!patient) {
      this.setMessage(
        'We could not verify that QR code or Patient ID. Please contact hospital reception.',
        'error'
      );
      return;
    }

    this.patientId = patient.patientId;
    this.setMessage(
      'Patient ID recognized. This record is protected; please contact hospital staff for access.',
      'success'
    );
  }

  private extractPatientId(value: string): string | null {
    const match = value.match(/\bP-\d+\b/i);
    return match?.[0] ?? null;
  }

  private setMessage(message: string, type: 'success' | 'error' | 'info'): void {
    this.message = message;
    this.messageType = type;
  }
}