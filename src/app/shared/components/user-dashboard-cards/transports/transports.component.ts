import { ChangeDetectorRef, Component } from '@angular/core';
import { ProfileService } from '../user-card/profile-service.service';

@Component({
  selector: 'app-transports',
  templateUrl: './transports.component.html',
  styleUrls: ['./transports.component.scss']
})
export class TransportsComponent {
  booking:any[] = [];

  activeTab: string = 'year';

  thisYear: any;
  filterdPackages: any = [];
  profiles: any[] = [];
  currentPage: number = 1;
  lastPage: number = 1;
  total: number = 0;
  userdata:any;
  selectedtransfer:any;
  loadProfiles(page: number): void {
    this.profileService.getProfiles(page).subscribe((data: any) => {
      this.profiles = data.userDashboard.data;
      this.userdata=data.userDashboard;
      this.booking = data.userDashboard.transferDetails.data; // Ensure this is correct
      this.filterdPackages = this.booking;
      this.currentPage = data.userDashboard.transferDetails.current_page;
      this.lastPage = data.userDashboard.transferDetails.last_page;
      this.total = data.userDashboard.transferDetails.total;
      this.cdr.markForCheck();
    });
  }
  openModal(tour: any) {
    this.selectedtransfer = tour;

  }
  nextPage(): void {
    if (this.currentPage < this.lastPage) {
      this.loadProfiles(this.currentPage + 1);
    }
  }

  prevPage(): void {

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
    this.filterdPackages = this.booking;
    this.thisYear = new Date().getFullYear();
  }

  setFilter(interval: string) {
    // Implement your logic to filter the table based on the selected interval
    this.activeTab = interval;
    if (interval == 'year') {
      this.filterdPackages = this.booking?.filter((item: any) => {
        return item.time.substr(0, 4) == this.thisYear.toString();
      });
    } else {
      this.filterdPackages = this.booking?.filter((item: any) => {
        return item.time.substr(0, 4) == interval.toString();
      });
    }
  }
}
