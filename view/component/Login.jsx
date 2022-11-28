import React from 'react';
import { connect } from 'react-redux';
import T from 'view/js/common';

class LoginPage extends React.Component {
    constructor (props) {
        super(props);
        this.txtEmail = React.createRef();
        this.txtPassword = React.createRef();
        this.btnSend = React.createRef();
        this.errorMessage = React.createRef();
    }

    componentDidUpdate() {
        if (this.props.system && this.props.system.user) window.location = '/user';
    }

    onSubmit = (e) => {
        e.preventDefault();
        const errorMessage = $(this.errorMessage.current);
        const data = {
            email: this.txtEmail.current.value.trim(),
            password: this.txtPassword.current.value
        };

        if (data.email === '') {
            this.txtEmail.current.focus();
        } else if (!T.validateEmail(data.email)) {
            errorMessage.html('Email không hợp lệ');
            this.txtEmail.current.focus();
        } else if (data.password === '') {
            this.txtPassword.current.focus();
        } else {
            this.props.login(data, result => {
                console.log(result);
                errorMessage.html(result.error);
                if (result.user) {
                    window.location = '/user';
                }
            });
        }
    }

    render() {
        return (
            <section className='login-block'>
                {/* Container-fluid starts */}
                <div className='container'>
                    <div className='row'>
                        <div className='col-sm-12'>
                            {/* Authentication card start */}
                            <form className='md-float-material form-material'>
                                <div className='text-center'>
                                    <img width='100px' src='/img/favicon.png' alt='logo.png' />
                                </div>
                                <div className='auth-box card'>
                                    <div className='card-block'>
                                        <div className='row m-b-20'>
                                            <div className='col-md-12'>
                                                <h3 className='text-center'>Sign In</h3>
                                            </div>
                                        </div>
                                        <div className='form-group form-primary'>
                                            <input ref={this.txtEmail} type='text' name='email' className='form-control' required placeholder='Your Email Address' />
                                            <span className='form-bar' />
                                        </div>
                                        <div className='form-group form-primary'>
                                            <input ref={this.txtPassword} type='password' name='password' className='form-control' required placeholder='Password' />
                                            <span className='form-bar' />
                                        </div>
                                        <p ref={this.errorMessage} className='text-danger'></p>
                                        {/* <div className="row m-t-25 text-left">
                                            <div className="col-12">
                                                <div className="checkbox-fade fade-in-primary d-">
                                                    <label>
                                                        <input type="checkbox" defaultValue />
                                                        <span className="cr"><i className="cr-icon icofont icofont-ui-check txt-primary" /></span>
                                                        <span className="text-inverse">Remember me</span>
                                                    </label>
                                                </div>
                                                <div className="forgot-phone text-right f-right">
                                                    <a href="auth-reset-password.htm" className="text-right f-w-600"> Forgot Password?</a>
                                                </div>
                                            </div>
                                        </div> */}
                                        <div className='row m-t-30'>
                                            <div className='col-md-12'>
                                                <button ref={this.btnSend} type='button' className='btn btn-primary btn-md btn-block waves-effect waves-light text-center m-b-20' onClick={this.onSubmit}>
                                                    Sign in
                                                </button>
                                            </div>
                                        </div>
                                        <hr />
                                        <div className='row'>
                                            <div className='col-md-10'>
                                                {/* <p className='text-inverse text-left m-b-0'>Thank you.</p> */}
                                                {/* <p className="text-inverse text-left"><a href="index-1.htm"><b className="f-w-600">Back to website</b></a></p> */}
                                            </div>
                                            {/* <div className='col-md-2'>
                                                <img width={50} src='/img/logo-cholimex.png' alt='small-logo.png' />
                                            </div> */}
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(LoginPage);