import React from 'react';
import {Modal, Input, OverlayTrigger, Tooltip} from 'react-bootstrap';
import Member from './member.jsx';
import {DashboardActions as Actions} from '../../actions/actions.js';

let CreateProject = React.createClass({
  getInitialState() {
    return {
      projectName: '',
      invitees: [],
      inviteeEmail: '',
      disableInvite: true,
      disableCreate: true
    };
  },

  checkEmail(e) {
    // consider replacing this with proper email validation
    this.setState({
      disableInvite: !e.target.value,
      inviteeEmail: e.target.value
    });
  },

  invite() {
    // let email = React.findDOMNode(this.refs.inviteeEmail).value;
    let email = this.refs.inviteeEmail.getValue();
    if (email) {
      let invitees = this.state.invitees.slice();
      invitees.push(email);
      this.setState({
        invitees: invitees,
        inviteeEmail: '',
        disableInvite: true
      });
    }
  },

  removeInvite(index) {
    let invitees = this.state.invitees.slice();
    invitees.splice(index, 1);
    this.setState({invitees: invitees});
  },

  checkName(e) {
    this.setState({
      disableCreate: !e.target.value,
      projectName: e.target.value.substr(0, 40)
    });
  },

  createProject() {
    let name = React.findDOMNode(this.refs.projectName).value;
    if (name) {
      Actions.createProject(name, this.state.invitees, (response) => { // check `response.error` for error
        this.close();
      });
    }
  },

  close() {
    this.props.close();
    this.setState(this.getInitialState());
  },

  render() {
    let inviteeList = (
      <div className='members'>
        <ul>
          {
            this.state.invitees.map((invitee, idx) => {
              return (
                <Member
                  key={idx}
                  idx={idx}
                  email={invitee}
                  remove={this.removeInvite}
                />
              );
            })
          }
        </ul>
      </div>
    );

    const inviteButton = (
      <button
        className='btn primary'
        onClick={this.invite}
        disabled={this.state.disableInvite}
      >
        Invite
      </button>
    );

    let letterCount = (
      <Tooltip id='project-letter-count'>{40 - this.state.projectName.length}</Tooltip>
    );

    return (
      <Modal show={this.props.showModal} onHide={this.close} dialogClassName='modal-create-project'>
        <Modal.Header closeButton>
          <Modal.Title>Create a New Project</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className='create-project'>
            <OverlayTrigger trigger='focus' placement='right' overlay={letterCount}>
              <input
                type='text'
                className='name'
                ref='projectName'
                placeholder='Title'
                onChange={this.checkName}
                value={this.state.projectName}
              />
            </OverlayTrigger>

            <label className='team'>Team Members</label>
            <form>
              <Input
                type='email'
                className='invitee'
                ref='inviteeEmail'
                placeholder='Email address'
                onChange={this.checkEmail}
                value={this.state.inviteeEmail}
                buttonAfter={inviteButton}
              />
            </form>

            {(() => {
              return this.state.invitees.length ? inviteeList : undefined;
            })()}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <button
            className='btn block primary'
            onClick={this.createProject}
            disabled={this.state.disableCreate}
          >
            Create project
          </button>
        </Modal.Footer>
      </Modal>
    );
  }
});

export default CreateProject;
