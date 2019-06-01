import * as React from "react";
import { emit } from "eiphop";
import {
  LoginPayload,
  LoginResponse,
  loginCall
} from "../../../api/actions/loginAction";
import {
  GetUserIdPayload,
  GetUserIdResponse,
  getUserIdCall
} from "../../../api/actions/getUserIdAction";

interface SandboxState {
  session: LoginResponse;
  user: GetUserIdResponse;
}

export class SandboxView extends React.PureComponent<any, SandboxState> {
  state: SandboxState = {
    session: {
      rvt: "",
      cookie: ""
    },
    user: {
      userId: ""
    }
  };

  handleLogin = () => {
    const values: LoginPayload = {
      username: "user",
      password: "password"
    };
    emit(loginCall, values)
      .then(res => this.setState({ session: res }))
      .catch(err => console.log(err));
  };

  handleGetUser = () => {
    if (this.state.session) {
      const values: GetUserIdPayload = {
        session: this.state.session
      };
      emit(getUserIdCall, values)
        .then(res => this.setState({ user: res }))
        .catch(err => console.log(err));
    }
  };

  render() {
    const { session, user } = this.state;
    return (
      <div>
        Session = {JSON.stringify(session)}
        <br />
        User Id = {JSON.stringify(user)}
        <br />
        <button onClick={this.handleLogin}>Login</button>
        <button onClick={this.handleGetUser}>Get UserId</button>
      </div>
    );
  }
}
