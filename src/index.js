import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Route, Link, Switch} from 'react-router-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import axios from "axios";

const API_BASE = 'https://bug-overflow.herokuapp.com';


const UserList = (props) => {
    const userItems = props.users.map((user) => {
        return (
            <UserListItem
                fname={user.fname}
                lname={user.lname}
                email={user.email}
                thumbnail={user.thumbnail}
                id={user.id}
                key={user.id}
                onDelete={props.onDelete}
                onEdit={props.onEdit}
            />
        )
    });

    return (
        <div className="user-list">
            <table className="table table-hover">
                <thead>
                <tr>
                    <th className="col-md-2">First Name</th>
                    <th className="col-md-2">Last Name</th>
                    <th className="col-md-2">Email</th>
                    <th className="col-md-2">Thumbnail</th>
                    <th className="col-md-2">Actions</th>
                </tr>
                </thead>
                <tbody>
                {userItems}
                </tbody>
            </table>
        </div>
    );
};

const UserListItem = (props) => {
    return (
        <tr>
            <td className="col-md-2">{props.fname}</td>
            <td className="col-md-2">{props.lname}</td>
            <td className="col-md-2">{props.email}</td>
            <td className="col-md-2">{props.thumbnail}</td>
            <td className="col-md-2 btn-toolbar">
                <button className="btn btn-success btn-sm" onClick={event => props.onEdit("edit", props)}>
                    <i className="glyphicon glyphicon-pencil"></i> Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={event => props.onDelete(props.id)}>
                    <i className="glyphicon glyphicon-remove"></i> Delete
                </button>
            </td>
        </tr>
    )
};

class Users extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            formMode: "new",
            user: {
                id: "-1",
                lname: "",
                fname: "",
                email: "",
                thumbnail: ""
            }
        };
        this.loadUsers = this.loadUsers.bind(this);
        this.removeUser = this.removeUser.bind(this);
        this.addUser = this.addUser.bind(this);
        this.updateUser = this.updateUser.bind(this);
        this.updateForm = this.updateForm.bind(this);
    }

    render() {
        return (
            <div className="users">
                <UserForm
                    onSubmit={(user) => this.formSubmitted(user)}
                    onCancel={(mode, user) => this.updateForm(mode, user)}
                    formMode={this.state.formMode}
                    user={this.state.user}
                    key={this.state.user.id}
                />
                <UserList
                    users={this.state.users}
                    onDelete={(id) => this.removeUser(id)}
                    onEdit={(mode, user) => this.updateForm(mode, user)}
                />
            </div>
        )
    }

    componentDidMount() {
        console.log('Users mounted!');
        this.loadUsers();
    }

    loadUsers() {
        axios
            .get(`${API_BASE}/users.json`)
            .then(res => {
                this.setState({users: res.data});
                console.log(`Data loaded! = ${this.state.users}`);
            })
            .catch(err => console.log(err));
    }

    addUser(newUser) {
        axios
            .post(`${API_BASE}/users.json`, newUser)
            .then(res => {
                console.log(res);
                res.data.key = res.data.id;
                this.setState({users: [...this.state.users, res.data]});
            })
            .catch(err => console.log(err));
    }

    updateUser(user) {
        axios
            .put(`${API_BASE}/users/${user.id}.json`, user)
            .then(res => {
                this.loadUsers();
            })
            .catch(err => console.log(err));
    }

    removeUser(id) {
        let filteredArray = this.state.users.filter(item => item.id !== id);
        this.setState({users: filteredArray});
        axios
            .delete(`${API_BASE}/users/${id}.json`)
            .then(res => {
                console.log(`Record Deleted`);
                this.clearForm();
            })
            .catch(err => console.log(err));
    }

    updateForm(mode, userParams) {
        this.setState({
            user: Object.assign({}, userParams),
            formMode: mode,
        });
    }

    clearForm() {
        console.log("clear form");
        this.updateForm("new", {
            id: "-1",
            lname: "",
            fname: "",
            email: "",
            thumbnail: ""
        });
    }

    formSubmitted(user) {
        if (this.state.formMode === "new") {
            console.log(user);
            this.addUser(user);
        } else {
            this.updateUser(user);
        }
        this.clearForm();
    }

}

class UserForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: props.user.id,
            lname: props.user.lname,
            fname: props.user.fname,
            email: props.user.email,
            thumbnail: props.user.thumbnail

        };
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
    }

    renderButtons() {
        if (this.props.formMode === "new") {
            return (
                <button type="submit" className="btn btn-primary">Create</button>
            );
        } else {
            return (
                <div className="form-group btn-toolbar">
                    <button type="submit" className="btn btn-primary">Save</button>
                    <button type="submit" className="btn btn-danger" onClick={this.handleCancel}>Cancel
                    </button>
                </div>);
        }
    }


    render() {
        return (
            <div className="user-form">
                <h1>Users</h1>
                <form onSubmit={this.handleSubmit}>
                    <div className="form-group">
                        <label>First Name</label>
                        <input type="text" className="form-control" autoComplete='given-name' name="fname" id="fname"
                               placeholder="First Name" value={this.state.fname} onChange={this.handleInputChange}/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="lname">Last Name</label>
                        <input type="text" className="form-control" autoComplete='family-name' name="lname" id="lname"
                               placeholder="Last Name" value={this.state.lname} onChange={this.handleInputChange}/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email address</label>
                        <input type="email" className="form-control" autoComplete='email' name="email" id="email"
                               placeholder="name@example.com" value={this.state.email}
                               onChange={this.handleInputChange}/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="thumbnail">Profile picture</label>
                        <input type="text" className="form-control" name="thumbnail" id="thumbnail"
                               placeholder="*.jpg / *.png / *.gif" value={this.state.thumbnail}
                               onChange={this.handleInputChange}/>
                    </div>
                    {this.renderButtons()}
                </form>
            </div>
        );
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });
    }

    handleSubmit(event) {
        this.props.onSubmit({
            id: this.state.id,
            lname: this.state.lname,
            fname: this.state.fname,
            email: this.state.email,
            thumbnail: this.state.thumbnail

        });
        event.preventDefault();
    }

    handleCancel(event) {
        this.props.onCancel("new", {fname: "", lname: "", email: "", thumbnail: ""});
        event.preventDefault();
    }

}


const BugList = (props) => {
    const bugItems = props.bugs.map((bug) => {
        let currentUser = props.users.filter(user => user.id === bug.user_id);
        return (
            <BugListItem
                title={bug.title}
                description={bug.description}
                user_id={bug.user_id}
                issue_type={bug.issue_type}
                priority={bug.priority}
                status={bug.status}
                id={bug.id}
                key={bug.id}
                user={currentUser[0]}
                onDelete={props.onDelete}
                onEdit={props.onEdit}
            />
        );

    });

    return (
        <div className="bug-list">
            <table className="table table-hover">
                <thead>
                <tr>
                    <th className="col-md">Title</th>
                    <th className="col-md">Description</th>
                    <th className="col-md">User</th>
                    <th className="col-md">Issue Type</th>
                    <th className="col-md">Priority</th>
                    <th className="col-md">Status</th>
                    <th className="col-md">Actions</th>
                </tr>
                </thead>
                <tbody>
                {bugItems}
                </tbody>
            </table>
        </div>
    );
};

const BugListItem = (props) => {
    console.log(props.user);
    if (props.user !== undefined) {
        return (
            <tr>
                <td className="col-md">{props.title}</td>
                <td className="col-md">{props.description}</td>
                <td className="col-md">{props.user.fname + " " + props.user.lname}</td>
                <td className="col-md">{props.issue_type}</td>
                <td className="col-md">{props.priority}</td>
                <td className="col-md">{props.status}</td>
                <td className="col-md btn-toolbar">
                    <button className="btn btn-success btn-sm" onClick={event => props.onEdit("edit", props)}>
                        <i className="glyphicon glyphicon-pencil"></i> Edit
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={event => props.onDelete(props.id)}>
                        <i className="glyphicon glyphicon-remove"></i> Delete
                    </button>
                </td>
            </tr>
        );
    } else {
        return null
    }
};

class Bugs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            bugs: [],
            users: [],
            formMode: "new",
            bug: {
                id: "-1",
                title: "",
                description: "",
                user_id: "-1",
                issue_type: "feature",
                priority: "medium",
                status: "open"
            }
        };
        this.loadBugs = this.loadBugs.bind(this);
        this.removeBug = this.removeBug.bind(this);
        this.addBug = this.addBug.bind(this);
        this.updateBug = this.updateBug.bind(this);
        this.updateForm = this.updateForm.bind(this);

    }

    render() {
        return (
            <div className="bugs">
                <BugForm
                    onSubmit={(bug) => this.formSubmitted(bug)}
                    onCancel={(mode, bug) => this.updateForm(mode, bug)}
                    formMode={this.state.formMode}
                    bug={this.state.bug}
                    key={this.state.bug.id}
                    users={this.state.users}
                />
                <BugList
                    bugs={this.state.bugs}
                    users={this.state.users}
                    onDelete={(id) => this.removeBug(id)}
                    onEdit={(mode, bug) => this.updateForm(mode, bug)}
                />
            </div>
        )
    }

    componentDidMount() {
        console.log('Bugs mounted!');
        this.loadBugs();
        this.loadUsers();
    }

    loadUsers() {
        axios
            .get(`${API_BASE}/users.json`)
            .then(res => {
                this.setState({users: res.data});
                console.log(`Data loaded! = ${this.state.users}`);
            })
            .catch(err => console.log(err));
    }

    loadBugs() {
        axios
            .get(`${API_BASE}/bugs.json`)
            .then(res => {
                this.setState({bugs: res.data});
                console.log(`Data loaded! = ${this.state.bugs}`)
            })
            .catch(err => console.log(err));

    }

    addBug(newBug) {
        axios
            .post(`${API_BASE}/bugs.json`, newBug)
            .then(res => {
                console.log(res);
                res.data.key = res.data.id;
                this.setState({bugs: [...this.state.bugs, res.data]});
            })
            .catch(err => console.log(err));
    }

    updateBug(bug) {
        axios
            .put(`${API_BASE}/bugs/${bug.id}.json`, bug)
            .then(res => {
                this.loadBugs();
            })
            .catch(err => console.log(err));
    }

    removeBug(id) {
        let filteredArray = this.state.bugs.filter(item => item.id !== id);
        this.setState({bugs: filteredArray});
        axios
            .delete(`${API_BASE}/bugs/${id}.json`)
            .then(res => {
                console.log(`Record Deleted`);
                this.clearForm();
            })
            .catch(err => console.log(err));
    }

    updateForm(mode, bugParams) {
        this.setState({
            bug: Object.assign({}, bugParams),
            formMode: mode,
        });
    }

    clearForm() {
        console.log("clear form");
        this.updateForm("new", {
            id: "-1",
            title: "",
            description: "",
            user_id: "-1",
            issue_type: "feature",
            priority: "medium",
            status: "open"
        });
    }

    formSubmitted(bug) {
        if (this.state.formMode === "new") {
            console.log(bug);
            this.addBug(bug);
        } else {
            this.updateBug(bug);
        }
        this.clearForm();
    }
}

class BugForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            users: props.users,
            id: props.bug.id,
            title: props.bug.title,
            description: props.bug.description,
            user_id: props.bug.user_id,
            issue_type: props.bug.issue_type,
            priority: props.bug.priority,
            status: props.bug.status,

        };
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
    }

    renderButtons() {
        if (this.props.formMode === "new") {
            return (
                <button type="submit" className="btn btn-primary">Create</button>
            );
        } else {
            return (
                <div className="form-group btn-toolbar">
                    <button type="submit" className="btn btn-primary">Save</button>
                    <button type="submit" className="btn btn-danger" onClick={this.handleCancel}>Cancel</button>
                </div>
            );
        }
    }

    render() {
        return (
            <div className="bug-form">
                <h1>Bugs</h1>
                <form onSubmit={this.handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <input type="text" className="form-control" name="title" id="title"
                               placeholder="Bug title" value={this.state.title} onChange={this.handleInputChange}/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea className="form-control" name="description" id="description"
                                  placeholder="Bug description" value={this.state.description}
                                  onChange={this.handleInputChange}/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="user_id">User</label>
                        <select className="form-control" name="user_id" id="user_id"
                                value={this.state.user_id} onChange={this.handleInputChange}>
                            {this.props.users.map((user) =>
                                <option key={user.id} value={user.id}>{user.fname + " " + user.lname}</option>)}
                        </select>

                    </div>
                    <div className="form-group">
                        <label htmlFor="issue_type">Issue Type</label>
                        <select className="form-control" name="issue_type" id="issue_type"
                                value={this.state.issue_type} onChange={this.handleInputChange}>
                            <option value="issue">Issue</option>
                            <option value="enhancement">Enhancement</option>
                            <option value="feature">Feature</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="priority">Priority</label>
                        <select className="form-control" name="priority" id="priority"
                                value={this.state.priority} onChange={this.handleInputChange}>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="status">Status</label>
                        <select className="form-control" name="status" id="status"
                                value={this.state.status} onChange={this.handleInputChange}>
                            <option value="open">Open</option>
                            <option value="closed">Close</option>
                            <option value="monitor">Monitor</option>
                        </select>
                    </div>
                    {this.renderButtons()}
                </form>
            </div>
        );
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });

    }

    handleSubmit(event) {
        this.props.onSubmit({
            id: this.state.id,
            title: this.state.title,
            description: this.state.description,
            user_id: this.state.user_id,
            issue_type: this.state.issue_type,
            priority: this.state.priority,
            status: this.state.status

        });
        event.preventDefault();
    }

    handleCancel(event) {
        this.props.onCancel("new", {
            title: "",
            description: "",
            issue_type: "feature",
            priority: "medium",
            status: "open"
        });
        event.preventDefault();
    }

}


ReactDOM.render(
    <BrowserRouter>
        <div>
            <ul>
                <li><Link to="/bugs">Bugs</Link></li>
                <li><Link to="/users">Users</Link></li>
            </ul>

            <Switch>
                <Route exact path="/bugs" component={Bugs}/>
                <Route exact path="/users" component={Users}/>
            </Switch>

        </div>
    </BrowserRouter>,
    document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();