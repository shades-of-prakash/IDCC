import { Component } from '@angular/core';
import { LucideAngularModule, ArrowRight } from 'lucide-angular';
@Component({
  selector: 'app-home',
  imports: [LucideAngularModule],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  readonly ArrowRight = ArrowRight;
}
