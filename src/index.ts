/**
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Elements of the port selection dropdown extend HTMLOptionElement so that
 * they can reference the SerialPort they represent.
 */

import "uno.css";

let openCashDrawer: HTMLButtonElement;
let port: SerialPort | undefined;

/**
 * Sets |port| to the currently selected port. If none is selected then the
 * user is prompted for one.
 */
async function getSelectedPort(): Promise<void> {
  if (!(await getDesiredPort())) {
    try {
      port = await navigator.serial.requestPort({});
    } catch (e) {
      if (e instanceof DOMException) {
        console.error(e.message);
      }
      return;
    }
  }
}

async function getDesiredPort(): Promise<boolean> {
  const availablePorts = await navigator.serial.getPorts();

  if (availablePorts.length > 0) {
    for (const portCandidate of availablePorts) {
      const portInfo = portCandidate.getInfo();
      console.log(portInfo);
      port = portCandidate;
    }
    return true;
  }

  return false;
}

/**
 * Initiates a connection to the selected port.
 */
async function connectToPort(): Promise<boolean> {
  if (!port) {
    await getSelectedPort();
    if (!port) {
      return false;
    }
  }

  const options = {
    baudRate: 9600,
  };

  try {
    await port.open(options);
  } catch (e) {
    console.error(e);
    if (e instanceof Error) {
      console.log(`<ERROR: ${e.message}>`);
    }
    return false;
  }

  return true;
}

/**
 * Writes 'Hello' to the currently active connection.
 */
async function writeToPort(): Promise<void> {
  if (port) {
    const writer = port.writable?.getWriter();
    if (writer) {
      const data = new Uint8Array([104, 101, 108, 108, 111]); // hello
      await writer.write(data);

      // Allow the serial port to be closed later.
      writer.releaseLock();
    } else {
      console.error("Could not write to serial port");
    }
  } else {
    console.error("No Serial port open");
  }
}

/**
 * Closes the currently active connection.
 */
async function disconnectFromPort(): Promise<void> {
  // Move |port| into a local variable so that connectToPort() doesn't try to
  // close it on exit.
  const localPort = port;
  port = undefined;

  if (localPort) {
    try {
      await localPort.close();
    } catch (e) {
      console.error(e);
    }
  }
}

function disableCashDrawerButton(button: HTMLButtonElement) {
  button.disabled = true;
  button.classList.replace("cursor-pointer", "cursor-not-allowed");
  button.textContent = "Opening Cash Drawer...";
}

function enableCashDrawerButton(button: HTMLButtonElement) {
  button.disabled = false;
  button.classList.replace("cursor-not-allowed", "cursor-pointer");
  button.textContent = "Open Cash Drawer";
}

async function connectEventListenersAndTryOpen() {
  openCashDrawer = document.getElementById("openDrawer") as HTMLButtonElement;
  openCashDrawer.addEventListener("click", async () => {
    disableCashDrawerButton(openCashDrawer);
    if (await connectToPort()) {
      await writeToPort();
      await disconnectFromPort();
    }
    setTimeout(enableCashDrawerButton, 200, openCashDrawer);
  });

  if (await getDesiredPort()) {
    disableCashDrawerButton(openCashDrawer);
    if (await connectToPort()) {
      await writeToPort();
      await disconnectFromPort();
      setTimeout(enableCashDrawerButton, 200, openCashDrawer);
    }
  }
}

if (
  document.readyState === "interactive" ||
  document.readyState === "complete"
) {
  connectEventListenersAndTryOpen();
} else {
  document.addEventListener(
    "DOMContentLoaded",
    connectEventListenersAndTryOpen
  );
}
