import { Component } from '@angular/core';
import { LucideAngularModule, MoveRight } from 'lucide-angular';

@Component({
  selector: 'app-home',
  imports: [LucideAngularModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  readonly MoveRight = MoveRight;
}
