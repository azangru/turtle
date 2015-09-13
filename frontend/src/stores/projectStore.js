import _ from 'lodash';
import Reflux from 'reflux';
import projects from '../ajax/projects';
import {ProjectActions, TaskActions, TaskContainerActions} from '../actions/actions';

const ProjectStore = Reflux.createStore({
  listenables: [ProjectActions, TaskActions, TaskContainerActions],

  onFetchProject(id) {
    projects.id(id).fetch().then((project) => {
      this.project = project;
      this.trigger(project);
    });
  },

  onStartSprint(cb) {
    projects.id(this.project.id).sprints.start()
      .then(() => {
        return projects.id(this.project.id).fetch();
      })
      .then((project) => {
        this.trigger(project);
      })
      .then(() => {
        cb();
      });
  },

  onEndSprint() {
    projects.id(this.project.id).sprints.end()
      .then(() => {
        return projects.id(this.project.id).fetch();
      })
      .then((project) => {
        this.project = project;
        this.project.currentSprint = {};
        this.trigger(this.project);
      });
  },

  onUpdateTaskPosLocally(params) {
    if (!this.project) {
      return;
    }

    let draggedTask = this.findTask(params.draggedTaskId);
    let targetTask = this.findTask(params.targetTaskId);

    if (draggedTask && targetTask) {
      // remove the dragged task from its previous place in the tasks array
      draggedTask.container.splice(draggedTask.container.indexOf(draggedTask), 1);

      // and then insert the dragged task before the target task
      targetTask.container.splice(targetTask.container.indexOf(targetTask), 0, draggedTask);

      this.trigger(this.project);
    }
  },

  onUpdateTaskPosOnServer(params) {
  },

  onAddTaskToContainerLocally(params) {
    let task = this.findTask(params.taskId);

    if (params.tasks !== task.container) {
      task.container.splice(task.container.indexOf(task), 1);

      if (task.container === this.project.backlog) {
        this.project.nextSprint.tasks.push(task);
      } else {
        this.project.backlog.push(task);
      }

      this.trigger(this.project);
    }
  },

  onAddTaskToContainerOnServer(taskId) {

  },

  findTask(taskId) {
    let task = _.findWhere(this.project.backlog, {id: taskId});
    if (task) {
      task.container = this.project.backlog;
      return task;
    }
    task = _.findWhere(this.project.nextSprint.tasks, {id: taskId});
    if (task) {
      task.container = this.project.nextSprint.tasks;
      return task;
    }
  }

});

export default ProjectStore;
