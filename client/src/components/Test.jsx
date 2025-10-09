import React from "react";
import SplitPane from "react-split-pane";

const BasicSlider = () => {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <SplitPane
        split="vertical"      // vertical splitter
        minSize={100}         // minimum left pane width
        maxSize={600}         // maximum left pane width
        defaultSize="50%"     // initial width of left pane
        allowResize={true}    // enable dragging
      >
        <div style={{ background: "#8BC34A", height: "100%" }}>
          Left Pane
        </div>
        <div style={{ background: "#FFC107", height: "100%" }}>
          Right Pane
        </div>
      </SplitPane>
    </div>
  );
};

export default BasicSlider;
