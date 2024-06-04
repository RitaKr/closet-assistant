import * as React from 'react';
import {useState} from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';




export default function DialogWindow(props) {

  return (
    
      <Dialog
        open={props.open}
        keepMounted
        onClose={props.handleClose}
        fullWidth={true}
        maxWidth={"md"}
        className="add-clothing-dialog"
        aria-describedby="alert-dialog-slide-description"
        
      >
        <DialogTitle>{props.title}
        <button className="icon-btn close-btn" aria-roledescription='close button' onClick={props.handleClose}>×</button>
        </DialogTitle>
        <DialogContent >
            
        {props.children}
        </DialogContent>
      
      </Dialog>
    
  );
}


