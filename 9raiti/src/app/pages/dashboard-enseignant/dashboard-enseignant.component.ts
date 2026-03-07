import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { TokenService } from '../../core/services/token.service';

@Component({
  selector: 'app-dashboard-enseignant', standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './dashboard-enseignant.component.html',
  styleUrls: ['./dashboard-enseignant.component.css']
})
export class DashboardEnseignantComponent implements OnInit {
  userName = '';
  activeSection = 'accueil';

  stats = [
    { icon: '📖', value: '5',   label: 'Cours publiés',         color: 'var(--blue)',   dim: 'var(--blue-dim)'   },
    { icon: '👥', value: '148', label: 'Étudiants inscrits',    color: 'var(--green)',  dim: 'var(--green-dim)'  },
    { icon: '⭐', value: '4.7', label: 'Note moyenne',           color: 'var(--brand)',  dim: 'var(--brand-dim)'  },
    { icon: '💬', value: '12',  label: 'Questions en attente',   color: 'var(--orange)', dim: 'var(--orange-dim)' },
  ];

  // Gestion Cours (use case du diagramme)
  courses = [
    { id:1, title:'Algèbre linéaire — Niveau L1', category:'Mathématiques', students:45, rating:4.8, status:'Publié',
      icon:'📐', color:'var(--blue)', dim:'var(--blue-dim)', modules:8, evals:4, lastUpdate:'10 Mar 2025' },
    { id:2, title:'Analyse numérique', category:'Mathématiques', students:32, rating:4.6, status:'Publié',
      icon:'📊', color:'var(--green)', dim:'var(--green-dim)', modules:6, evals:3, lastUpdate:'8 Mar 2025' },
    { id:3, title:'Probabilités et statistiques', category:'Mathématiques', students:0, rating:0, status:'Brouillon',
      icon:'🎲', color:'var(--brand)', dim:'var(--brand-dim)', modules:3, evals:0, lastUpdate:'5 Mar 2025' },
  ];

  // Gestion Modules (use case du diagramme)
  modules = [
    { id:1, course:'Algèbre linéaire', title:'Introduction aux matrices',    order:1, lessons:5, duration:'1h30', status:'publié' },
    { id:2, course:'Algèbre linéaire', title:'Espaces vectoriels',           order:2, lessons:4, duration:'2h',   status:'publié' },
    { id:3, course:'Algèbre linéaire', title:'Déterminants et applications', order:3, lessons:6, duration:'2h30', status:'publié' },
    { id:4, course:'Analyse numérique', title:'Méthodes itératives',         order:1, lessons:4, duration:'1h45', status:'publié' },
    { id:5, course:'Probabilités',      title:'Variables aléatoires',         order:1, lessons:3, duration:'1h20', status:'brouillon' },
  ];

  // Gestion Évaluations (use case du diagramme)
  evaluations = [
    { id:1, title:'Quiz — Matrices (Ch.1)', course:'Algèbre linéaire', type:'quiz', dueDate:'15 Mar', submissions:38, total:45, avgScore:15.2, iaGenerated:true },
    { id:2, title:'Examen mi-session',       course:'Algèbre linéaire', type:'examen', dueDate:'20 Mar', submissions:0,  total:45, avgScore:0,    iaGenerated:false },
    { id:3, title:'Quiz — Méthodes it.',     course:'Analyse numérique', type:'quiz', dueDate:'12 Mar', submissions:28, total:32, avgScore:14.8, iaGenerated:true },
  ];

  // Liste apprenants + engagement (use case du diagramme)
  apprenants = [
    { id:1, name:'Karim M.',   email:'karim@mail.com',   course:'Algèbre linéaire',  progress:78, lastActivity:"Aujourd'hui", score:16.5, engagement:'élevé',  sessions:12 },
    { id:2, name:'Fatima Z.',  email:'fatima@mail.com',  course:'Algèbre linéaire',  progress:55, lastActivity:'Hier',         score:14.0, engagement:'moyen',  sessions:7  },
    { id:3, name:'Yassine B.', email:'yassine@mail.com', course:'Analyse numérique', progress:90, lastActivity:"Aujourd'hui", score:18.0, engagement:'élevé',  sessions:20 },
    { id:4, name:'Sara L.',    email:'sara@mail.com',    course:'Algèbre linéaire',  progress:30, lastActivity:'3 jours',      score:11.0, engagement:'faible', sessions:3  },
    { id:5, name:'Omar D.',    email:'omar@mail.com',    course:'Analyse numérique', progress:65, lastActivity:'Hier',         score:15.5, engagement:'moyen',  sessions:9  },
  ];

  recentActivities = [
    { date:"Aujourd'hui", student:'Karim M.',   initial:'K', course:'Algèbre linéaire',   action:'Quiz complété — 16/20',        color:'var(--blue)'   },
    { date:'Hier',        student:'Fatima Z.',  initial:'F', course:'Algèbre linéaire',   action:'Chapitre 3 terminé',            color:'var(--green)'  },
    { date:'25 Fév',      student:'Yassine B.', initial:'Y', course:'Analyse numérique',  action:'Quiz #2 — 18/20',               color:'var(--brand)'  },
    { date:'24 Fév',      student:'Sara L.',    initial:'S', course:'Algèbre linéaire',   action:'Première connexion',            color:'var(--purple)' },
  ];

  // Gestion Catégories
  categories = [
    { id:1, name:'Mathématiques', icon:'🧮', color:'var(--blue)',   courses:12, apprenants:245 },
    { id:2, name:'Informatique',  icon:'💻', color:'var(--green)',  courses:8,  apprenants:180 },
    { id:3, name:'Sciences',      icon:'⚛️', color:'var(--orange)', courses:6,  apprenants:120 },
    { id:4, name:'Langues',       icon:'🌐', color:'var(--purple)', courses:5,  apprenants:95  },
  ];

  showNewCourseModal = false;
  showNewModuleModal = false;
  newCourseTitle = '';
  newCourseCategory = '';

  constructor(private tokenService: TokenService) {}
  ngOnInit(): void { this.userName = this.tokenService.getDisplayName(); }
  setSection(s: string) { this.activeSection = s; }

  getEngagementColor(e: string): string {
    if (e === 'élevé') return 'var(--green)';
    if (e === 'moyen') return 'var(--brand)';
    return 'var(--red)';
  }
  getEngagementClass(e: string): string {
    if (e === 'élevé') return 'b-green';
    if (e === 'moyen') return 'b-brand';
    return 'b-red';
  }
}
