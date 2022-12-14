// import user from 'modules/_default/fwUser/controller/user';
import React from 'react';
import { connect } from 'react-redux';
import T from 'view/js/common';

class LoginPage extends React.Component {
    constructor (props) {
        document.title = 'Login';
        super(props);
        this.txtEmail = React.createRef();
        this.txtPassword = React.createRef();
        this.btnSend = React.createRef();
        this.errorMessage = React.createRef();
    }

    componentDidMount() {
        let user = this.props.system && this.props.system.user;
        if (user) {
            let session = user,
                type = session.type;
            if (type == 'system') window.location.pathname = '/dashboard';
            else {
                if (user.authen) {
                    window.location.pathname = '/user';
                }
                else {
                    window.location.pathname = '/pin-authen';
                }
            }
        }
    }

    componentDidUpdate() {
        if (this.props.system && this.props.system.user) window.location = '/user';
    }

    rand(items) {
        return items[~~(items.length * Math.random())];
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
            T.post('/api/user/login-by-pass', data, result => {
                if (result.error) {
                    errorMessage.html('Xác thực thất bại');
                } else {
                    if (result && result.session) {
                        let session = result.session,
                            type = session.type;
                        if (type == 'system') window.location.pathname = '/dashboard';
                        else {
                            window.location.pathname = '/user';
                        }
                    } else {
                        window.location.pathname = '/pin-authen';
                    }

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
                                                <button ref={this.btnSend} type='button' className='btn btn-primary btn-md btn-block waves-effect waves-light text-center m-b-10' onClick={this.onSubmit}>
                                                    Sign in
                                                </button>
                                            </div>
                                            {/* <div className='col-md-12'>
                                                <button ref={this.btnSend} type='button' className='btn btn-warning btn-md btn-block waves-effect waves-light text-center m-b-20' onClick={() => this.props.history.push('/register')}>
                                                    Register
                                                </button>
                                            </div> */}
                                        </div>
                                        <hr />
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