import * as React from "react";
import {
  Formik,
  Field
  // Form,
  // FormikActions,
  // FormikProps,
  // FieldProps
} from "formik";
import { emit } from "eiphop";
import {
  LoginPayload,
  LoginResponse,
  loginCall
} from "../../../api/actions/loginAction";
import { InputField } from "../Fields/InputFields";
interface LoginState {
  session: LoginResponse;
}

const initialValues: LoginPayload = {
  username: "",
  password: ""
};

export class LoginView extends React.PureComponent<any, LoginState> {
  state: LoginState = {
    session: {
      rvt: "",
      cookie: ""
    }
  };

  render() {
    // const { session } = this.state;
    return (
      <Formik
        onSubmit={(values, { resetForm }) => {
          emit(loginCall, values)
            .then(res => this.setState({ session: res }))
            .catch(err => console.log(err))
            .finally(() => {
              resetForm(initialValues);
            });
        }}
        initialValues={initialValues}
      >
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <Field
              name="username"
              placeholder="username"
              component={InputField}
            />
            <br />
            <Field
              name="password"
              placeholder="password"
              type="password"
              component={InputField}
            />
            <br />
            <button type="submit">Login</button>
            <hr />
            rvt = {this.state.session.rvt}
          </form>
        )}
      </Formik>
    );
  }
}
