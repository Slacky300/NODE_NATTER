import React from 'react';
import { Button, Modal } from 'react-bootstrap';

const DialogBox = ({ showDialog, cancelNavigation, confirmNavigation }) => {
  return (
    <Modal show={showDialog}>
      <Modal.Header>
        <Modal.Title>Warning</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <b>There are some changes?</b>
        <br /> Are you sure you want to navigate!!!!
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={cancelNavigation}>
          No
        </Button>
        <Button variant="danger" onClick={confirmNavigation}>
          Yes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DialogBox;
