/* eslint-disable */

import '@babel/polyfill';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { buyPet } from './stripe';
import { signup } from './signup';
import { showAlert } from './alerts';

// DOM ELEMENTS
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const buyBtn = document.getElementById('buy-pet');
const signupForm = document.querySelector('#signup-form');
const signupSubmitBtn = document.querySelector('#submit-signup-data');

// DELEGATIONS
// LOGGING IN
if (loginForm)
  loginForm.addEventListener('submit', (e) => {
    // prevent default
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });

// LOGOUT
if (logOutBtn) logOutBtn.addEventListener('click', logout);

// UPDATE USER DATA
if (userDataForm)
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings(form, 'data');
  });

// SIGNUP
if (signupForm)
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    const errMessage = document.querySelector('.password-error');

    console.log(name, email, password, passwordConfirm);
    if (password !== passwordConfirm) {
      showAlert('error', 'Passwords do not match');
    }
    signup(name, email, password, passwordConfirm);
  });

// UPDATE PASSWORD
if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // SHOW PROCESS PROGRESS TO CLIENT
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
  });

// BUY PET
if (buyBtn)
  buyBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { petId } = e.target.dataset;
    buyPet(petId);
  });

// ALERTS
const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 12);
