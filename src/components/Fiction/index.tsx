import * as React from "react";

export interface FictionProps {
  name: string;
  id: string;
  imgSrc: string;
  // page: string;
}

function Fiction(props: FictionProps) {
  return (
    <React.Fragment>
      <img
        src={props.imgSrc}
        alt={`Cover image for ${props.name}`}
        width={"200"}
        height={"300"}
      />
      <h4>
        {props.name} - {props.id}
      </h4>
    </React.Fragment>
  );
}
