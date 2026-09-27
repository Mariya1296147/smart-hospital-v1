import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Router,
  ActivatedRoute,
  RouterLink
} from '@angular/router';
import { Nurse } from '../../../models/nursing';
import { NurseService } from '../../../core/services/nursing.service';



@Component({
  selector: 'app-nurse-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './nurse-form.component.html',
  styleUrl: './nurse-form.component.css'
})
export class NurseFormComponent implements OnInit {

  isEdit = false;
  nurseId = 0;

  nurse: Nurse = {
    id: 0,
    nurseId: '',
    name: '',
    gender: '',
    phone: '',
    email: '',
    department: '',
    ward: '',
    shift: '',
    qualification: '',
    joiningDate: '',
    status: 'Active'
  };

  constructor(
    private nurseService: NurseService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get('id');

    if (id) {

      this.isEdit = true;

      this.nurseId = Number(id);

      const existingNurse =
        this.nurseService.getNurseById(this.nurseId);

      if (existingNurse) {
        this.nurse = { ...existingNurse };
      }
    }
  }

  saveNurse(): void {

    if (this.isEdit) {

      this.nurseService.updateNurse(this.nurse);

      alert('Nurse updated successfully!');

    } else {

      this.nurseService.addNurse(this.nurse);

      alert('Nurse added successfully!');
    }

    this.router.navigate(['/admin/nursing']);
  }
}