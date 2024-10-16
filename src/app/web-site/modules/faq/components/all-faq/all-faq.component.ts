import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HttpService } from 'src/app/core/services/http/http.service';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-all-faq',
  templateUrl: './all-faq.component.html',
  styleUrls: ['./all-faq.component.scss'],
})
export class AllFaqComponent {
  questions: any = [];
  cover: any = '';
  topics: any = [];
  activeCategory: string | number = 'all';
  filteredQuestions: any = [];
  selectedCategory = 'All';
  constructor(
    public translate: TranslateService,
    private httpService: HttpService
  ) {}

  ngOnInit() {
    this.httpService.get(environment.marsa, 'faq').subscribe(
      (res: any) => {
        console.log(res);
        this.questions = res?.FAQ;
        this.filteredQuestions = this.questions;
        this.cover = res?.cover;
        this.topics = res?.Topic;
        console.log(this.topics[0].id);
        console.log(this.questions);
      },
      (err) => {}
    );
  }

  filterByCategory(category: any) {
    this.activeCategory = category === 'all' ? 'all' : category.id;

    if (category === 'all') {
      this.filteredQuestions = this.questions;
      this.selectedCategory = 'All';
    } else {
      this.selectedCategory = category.name;
      this.filteredQuestions = this.questions.filter(
        (question: any) => question.topic_id === category.id
      );
    }
  }
  


}
