import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { ProfileService } from 'src/app/core/services/http/profile-service.service';

@Component({
  selector: 'app-packages',
  templateUrl: './packages.component.html',
  styleUrls: ['./packages.component.scss'],
})
export class PackagesComponent {
  @Input() packages: any;
  activeTab: string = 'year';

  thisYear: any;
  filterdPackages: any = [];
  profiles: any[] = [];
  currentPage: number = 1;
  lastPage: number = 1;
  total: number = 0;

  loadProfiles(page: number): void {
    this.profileService.getProfiles(page).subscribe((data: any) => {
      // console.log('API Response:', data);
      this.profiles = data.userDashboard.data;
      this.packages = data.userDashboard.packageDetails.data; // Ensure this is correct
      // console.log('packages Data:', this.packages);
      this.filterdPackages = this.packages;
      this.currentPage = data.userDashboard.packageDetails.current_page;
      this.lastPage = data.userDashboard.packageDetails.last_page;
      this.total = data.userDashboard.packageDetails.total;
      this.cdr.markForCheck();
    });
  }

  nextPage(): void {
    if (this.currentPage < this.lastPage) {
      this.loadProfiles(this.currentPage + 1);
    }
  }

  prevPage(): void {
    // console.log(215);

    if (this.currentPage > 1) {
      this.loadProfiles(this.currentPage - 1);
    }
  }

  constructor(
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges() {
  }

  ngOnInit() {
    this.loadProfiles(this.currentPage);
    this.filterdPackages = this.packages;
    this.thisYear = new Date().getFullYear();
    // console.log(this.thisYear);
  }

  setFilter(interval: string) {
    // Implement your logic to filter the table based on the selected interval
    this.activeTab = interval;
    if (interval == 'year') {
      this.filterdPackages = this.packages?.filter((item: any) => {
        return item.time.substr(0, 4) == this.thisYear.toString();
      });
      // console.log(this.filterdPackages);
    } else {
      this.filterdPackages = this.packages?.filter((item: any) => {
        return item.time.substr(0, 4) == interval.toString();
      });
      // console.log(this.filterdPackages);
    }
  }
}
