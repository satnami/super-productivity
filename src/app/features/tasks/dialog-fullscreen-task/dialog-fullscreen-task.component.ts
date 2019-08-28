import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Task, TaskCopy, TimeSpentOnDayCopy} from '../task.model';
import {TaskService} from '../task.service';
import {getTodayStr} from '../util/get-today-str';
import {createTaskCopy} from '../util/create-task-copy';
import {DialogAddTimeEstimateForOtherDayComponent} from '../dialog-add-time-estimate-for-other-day/dialog-add-time-estimate-for-other-day.component';
import {getWorklogStr} from '../../../util/get-work-log-str';
import {T} from '../../../t.const';


@Component({
  selector: 'dialog-fullscreen-task',
  templateUrl: './dialog-fullscreen-task.component.html',
  styleUrls: ['./dialog-fullscreen-task.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogFullscreenTaskComponent {
  T = T;
  todayStr: string;
  task: Task;
  taskCopy: TaskCopy;
  timeSpentOnDayCopy: TimeSpentOnDayCopy;

  constructor(private _matDialogRef: MatDialogRef<DialogFullscreenTaskComponent>,
              private _matDialog: MatDialog,
              private _taskService: TaskService,
              private _cd: ChangeDetectorRef,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.task = this.data.task;
    this.todayStr = getTodayStr();
    this._taskService = _taskService;
    this.taskCopy = createTaskCopy(this.task);
    this.timeSpentOnDayCopy = this.taskCopy.timeSpentOnDay || {};
  }


  submit() {
    this._taskService.update(this.taskCopy.id, {
      timeEstimate: this.taskCopy.timeEstimate,
      timeSpentOnDay: this.timeSpentOnDayCopy,
    });
    this._matDialogRef.close({
      timeEstimate: this.taskCopy.timeEstimate,
      timeSpentOnDay: this.timeSpentOnDayCopy,
    });
  }

  showAddForAnotherDayForm() {
    this._matDialog.open(DialogAddTimeEstimateForOtherDayComponent).afterClosed().subscribe((result) => {
      if (result && result.timeSpent > 0 && result.date) {
        this.timeSpentOnDayCopy = {
          ...this.timeSpentOnDayCopy,
          [getWorklogStr(result.date)]: result.timeSpent,
        };
        this.taskCopy.timeSpentOnDay = this.timeSpentOnDayCopy;
        this._cd.detectChanges();
      }
    });
  }


  deleteValue(strDate) {
    delete this.timeSpentOnDayCopy[strDate];
  }
}
