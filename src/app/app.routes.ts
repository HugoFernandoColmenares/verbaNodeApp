import { Routes } from '@angular/router';

import { Commit } from './features/commit/commit';
import { Git } from './features/git/git';
import { History } from './features/history/history';
import { Pr } from './features/pr/pr';
import { Prompt } from './features/prompt/prompt';

export const routes: Routes = [
  { path: '', component: Commit },
  { path: 'pr', component: Pr },
  { path: 'prompt', component: Prompt },
  { path: 'git', component: Git },
  { path: 'history', component: History },
];
