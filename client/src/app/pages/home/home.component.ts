import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowRight } from 'lucide-angular';
@Component({
  selector: 'app-home',
  imports: [LucideAngularModule,RouterModule],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  readonly ArrowRight = ArrowRight;
}
