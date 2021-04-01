import { Injectable } from '@angular/core';

import { Comment, IComment } from 'src/app/models/comment';
import { IRow } from 'src/app/models/row';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

    constructor() {}

    addComment(row: IRow, value: string) {
        const comment = new Comment(value);
        row.comments.push(comment);
    }

    deleteComment(row: IRow, comment: IComment) {
        const idx = row.comments.indexOf(comment);
        row.comments.splice(idx, 1);
    }

    editComment(comment: IComment, value: string) {
        comment.newValue(value);
        comment.setAsEdited();
        comment.updateDate();
    }
}
