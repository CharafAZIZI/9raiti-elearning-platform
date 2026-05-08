import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InteractionService } from '../../core/services/interaction.service';
import { TokenService } from '../../core/services/token.service';
import { CommentaireDTO } from '../../models/interaction.model';

@Component({
  selector: 'app-cours-interaction',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, DatePipe],
  templateUrl: './cours-interaction.component.html',
  styleUrls: ['./cours-interaction.component.css']
})
export class CoursInteractionComponent implements OnInit, OnChanges {
  @Input() coursId!: number;
  @Input() userRole = '';

  loading = false; likeLoading = false; noteLoading = false; commentLoading = false;

  totalLikes = 0; userALike = false;
  noteUtilisateur = 0; hoverNote = 0;
  moyenneNotes: number | null = null; totalNotes = 0;

  commentaires: CommentaireDTO[] = [];
  showComments = false;
  newComment = '';
  feedbackMsg = ''; feedbackError = false;
  stars = [1, 2, 3, 4, 5];

  private currentUserId: number | null = null;

  constructor(private interSvc: InteractionService, private tokenSvc: TokenService) {}

  ngOnInit(): void {
    this.currentUserId = this.tokenSvc.getEnseignantId();
    if (this.coursId) this.load();
  }

  ngOnChanges(c: SimpleChanges): void {
    if (c['coursId'] && !c['coursId'].firstChange) this.load();
  }

  load(): void {
    this.loading = true;
    this.interSvc.getInteractions(this.coursId).subscribe({
      next: d => {
        this.totalLikes = d.totalLikes; this.userALike = d.userALike;
        this.noteUtilisateur = d.noteUtilisateur ?? 0;
        this.moyenneNotes = d.moyenneNotes ?? null; this.totalNotes = d.totalNotes ?? 0;
        this.commentaires = d.commentaires ?? [];
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  toggleLike(): void {
    if (this.likeLoading) return;
    this.likeLoading = true;
    this.interSvc.toggleLike(this.coursId).subscribe({
      next: r => {
        this.totalLikes = r.totalLikes; this.userALike = r.liked;
        this.likeLoading = false;
        this.flash(r.liked ? '❤️ Cours aimé !' : 'Like retiré.', false);
      },
      error: () => { this.likeLoading = false; this.flash('Erreur.', true); }
    });
  }

  noterCours(note: number): void {
    if (this.noteLoading) return;
    this.noteLoading = true;
    this.interSvc.noterCours(this.coursId, note).subscribe({
      next: r => {
        this.noteUtilisateur = note;
        this.moyenneNotes = r.moyenneNotes ?? null; this.totalNotes = r.totalNotes ?? 0;
        this.noteLoading = false;
        this.flash(`⭐ Note ${note}/5 enregistrée !`, false);
      },
      error: () => { this.noteLoading = false; this.flash('Erreur notation.', true); }
    });
  }

  submitComment(): void {
    const contenu = this.newComment.trim();
    if (!contenu || this.commentLoading) return;
    this.commentLoading = true;
    this.interSvc.ajouterCommentaire({ coursId: this.coursId, contenu }).subscribe({
      next: c => {
        this.commentaires = [c, ...this.commentaires];
        this.newComment = ''; this.commentLoading = false;
        this.flash('💬 Commentaire ajouté !', false);
      },
      error: () => { this.commentLoading = false; this.flash('Erreur envoi.', true); }
    });
  }

  deleteComment(c: CommentaireDTO): void {
    if (!c.id) return;
    this.interSvc.supprimerCommentaire(this.coursId, c.id).subscribe({
      next: () => { this.commentaires = this.commentaires.filter(x => x.id !== c.id); this.flash('Supprimé.', false); },
      error: () => this.flash('Erreur suppression.', true)
    });
  }

  canDelete(c: CommentaireDTO): boolean {
    return this.userRole === 'admin' || (this.currentUserId !== null && c.auteurId === this.currentUserId);
  }

  getInitials(name?: string): string {
    if (!name) return '?';
    const p = name.trim().split(' ');
    return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
  }

  private flash(msg: string, err: boolean): void {
    this.feedbackMsg = msg; this.feedbackError = err;
    setTimeout(() => this.feedbackMsg = '', 3500);
  }
}
