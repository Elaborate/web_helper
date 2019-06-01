import * as React from "react";

export interface AppProps {
  compiler: string;
  framework: string;
}

// 'HelloProps' describes the shape of props.
// State is never set so we use the '{}' type.
export class App extends React.PureComponent<AppProps, {}> {
  render() {
    return (
      <div>
        <h1>
          Hello from {this.props.compiler} and {this.props.framework}!
        </h1>
      </div>
    );
  }
}
