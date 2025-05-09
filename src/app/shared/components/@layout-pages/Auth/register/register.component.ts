import { Auth } from './../auth';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { Router } from '@angular/router';
import { HttpService } from 'src/app/core/services/http/http.service';
import { environment } from 'src/environments/environment.prod';
import { CountryISO, SearchCountryField } from 'ngx-intl-tel-input';
import { ToastrService } from 'ngx-toastr';
import { CodeService } from '../services/code.service';
import { MatDialog } from '@angular/material/dialog';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { TranslateService } from '@ngx-translate/core';
declare const google: any;
import { AbstractControl, ValidationErrors } from '@angular/forms';

// Custom email validator
export function emailFormatValidator(
  control: AbstractControl
): ValidationErrors | null {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isValid = emailRegex.test(control.value);
  return isValid ? null : { invalidEmail: true };
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  @Output() close: EventEmitter<void> = new EventEmitter<void>();
  isPasswordVisible1 = false;
  isPasswordVisible2 = false;
  socialUser!: SocialUser;
  isLoggedin?: boolean;
  idToken: any;
  signupForm!: FormGroup;
  terms: boolean = false;
  showRegisterForm: boolean = true;
  showCodeSignForm: boolean = true;

  constructor(
    // private socialAuthService: SocialAuthService,
    private authService: AuthService,
    private fb: FormBuilder,
    // private _Router: Router,
    public translate: TranslateService,
    private codeService: CodeService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {}
  ngOnInit(): void {
    this.initialForm();
  }

  initialForm(): void {
    this.signupForm = this.fb.group(
      {
        name: ['', Validators.required],
        email: ['', [Validators.required, emailFormatValidator]], // Use the custom email validator
        phone: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        password_confirmation: [
          '',
          [Validators.required, Validators.minLength(8)],
        ],
        country_code: [''],
        role: [0, [Validators.required, Validators.min(1)]],
      },
      { validators: this.passwordMatchValidator }
    );

    this.signupForm.get('role')?.valueChanges.subscribe((value) => {
      this.signupForm
        .get('role')
        ?.setValue(value ? 1 : 0, { emitEvent: false });
    });
  }
  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('password_confirmation')?.value;

    if (password !== confirmPassword) {
      control.get('password_confirmation')?.setErrors({ mismatch: true });
    } else {
      control.get('password_confirmation')?.setErrors(null);
    }
  }
  checkTerms(event: any) {
    this.terms = event.target.checked;
  }
  closeRegister() {
    this.showRegisterForm = false;
    this.showCodeSignForm = false;
    this.dialog?.closeAll();
    this.close.emit(); // Emit the close event
  }

  get CountryISO(): typeof CountryISO {
    return CountryISO;
  }

  toggleVisibility1() {
    this.isPasswordVisible1 = !this.isPasswordVisible1;
  }
  toggleVisibility2() {
    this.isPasswordVisible2 = !this.isPasswordVisible2;
  }

  get SearchCountryField(): typeof SearchCountryField {
    return SearchCountryField;
  }

  get name() {
    return this.signupForm.get('name')!;
  }
  get email() {
    return this.signupForm.get('email')!;
  }
  get phone() {
    return this.signupForm.get('phone')!;
  }
  get password() {
    return this.signupForm.get('password')!;
  }
  get password_confirmation() {
    return this.signupForm.get('password_confirmation')!;
  }

  get role() {
    return this.signupForm.get('role')!;
  }

  // onCountryChange(event: any) {
  //   console.log(event);
  //   console.log(this.customerForm.value);
  //   let x =
  //     '+' +
  //     event.dialCode +
  //     this.customerForm.value.phone.nationalNumber?.replace('-', '');
  //   this.customerForm?.get('phone')?.patchValue(x);
  //   console.log(x);
  // }
  register(form: FormGroup) {
    if (form.invalid) {
      if (this.email.errors && this.email.errors['invalidEmail']) {
        this.toastr.error('Please enter a valid email address.', '', {
          disableTimeOut: false,
          titleClass: 'toastr_title',
          messageClass: 'toastr_message',
          timeOut: 5000,
          closeButton: true,
        });
      } else if (
        this.email.errors ||
        this.password.errors ||
        this.name.errors ||
        this.email.errors ||
        this.phone.errors
      ) {
        this.toastr.error('Check Missing Fields', '', {
          disableTimeOut: false,
          titleClass: 'toastr_title',
          messageClass: 'toastr_message',
          timeOut: 5000,
          closeButton: true,
        });
      } else if (this.role.errors) {
        this.toastr.error('Please agree to the Terms and Privacy Policy', '', {
          disableTimeOut: false,
          titleClass: 'toastr_title',
          messageClass: 'toastr_message',
          timeOut: 5000,
          closeButton: true,
        });
      }

      return;
    }

    const model = {
      ...this.signupForm.value,
      phone: this.signupForm.get('phone')?.value['number'],
      country_code: this.signupForm.get('phone')?.value['dialCode'],
    };

    this.authService.register(model).subscribe({
      next: (res: any) => {
        this.showCodeSignForm = !this.showCodeSignForm;
        this.toastr.success(res.message, ' ', {
          disableTimeOut: false,
          titleClass: 'toastr_title',
          messageClass: 'toastr_message',
          timeOut: 5000,
          closeButton: true,
        });
        this.codeService.setUserData(res.user_id);
      },
      error: (err) => {
        console.error('Error Response:', err);
        const errorMessage = err?.error?.message || 'An error occurred';
        this.toastr.error(errorMessage, '', {
          disableTimeOut: false,
          titleClass: 'toastr_title',
          messageClass: 'toastr_message',
          timeOut: 5000,
          closeButton: true,
        });
      },
    });
  }

  toggleForm(): void {
    this.showRegisterForm = !this.showRegisterForm;
  }

  urgent: any;
  isUrgent() {
    this.urgent = true;
  }
  isUrgent0() {}
  // ngAfterViewInit(): void {
  //   this.socialAuthService.authState.subscribe((user) => {
  //     this.socialUser = user;
  //     this.idToken = this.socialUser.idToken
  //   });

  //   google.accounts.id.initialize({
  //     client_id: environment.googleClientId,
  //     callback: this.handleCredentialResponse.bind(this)
  //   });

  //   google.accounts.id.renderButton(
  //     document.getElementById('google-signin-button'),
  //     { theme: 'outline', size: 'large' }
  //   );

  //   google.accounts.id.prompt(); // Display the One Tap dialog
  // }

  handleCredentialResponse(response: any) {
    const model = {
      idToken: this.idToken,
      provider: 'GOOGLE',
    };
    this.authService.externalLogin(model);
  }
}
