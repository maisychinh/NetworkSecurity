import React from 'react';
import PinInput from 'react-pin-input';
import { connect } from 'react-redux';
import T from 'view/js/common';

class PinAuthenPage extends React.Component {

    constructor (props) {
        document.title = 'PIN Authenticate';
        super(props);
        this.errorMessage = React.createRef();
    }
    componentDidMount() {
        if (!this.props.system.user) {
            window.location = '/';
        }
    }

    componentDidUpdate() {
        if (this.props.system && this.props.system.user.authen) window.location = '/user';
    }

    rand(items) {
        // "~~" for a closest "int"
        return items[~~(items.length * Math.random())];
    }

    onSubmit = (e) => {
        e.preventDefault();
        const errorMessage = $(this.errorMessage.current);
        const data = {
            pinCode: this.state.pinInput
        };
        if (data.pin === '') {
            this.pin.focus();
        } else {
            T.post('/api/user/login-by-pin', { data }, result => {
                if (result.error) {
                    errorMessage.html('Xác thực thất bại');
                } else {
                    window.location.pathname = '/user';
                }
            });
        }
    }

    render() {
        let user = this.props.system?.user || { email: '' };
        return (
            <section className='login-block'>
                <div className='container'>
                    <div className='row'>
                        <div className='col-sm-12'>
                            <form className='md-float-material form-material'>
                                <div className='text-center'>
                                    <img width='100px' src='/img/favicon.png' alt='logo.png' />
                                </div>
                                <div className='auth-box card'>
                                    <div className='card-block'>
                                        <div className='row m-b-20'>
                                            <div className='col-md-12'>
                                                <h3 className='text-center'>PIN Authenticate</h3>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <h5 className='m-b-20'>{user.email}</h5>
                                            <PinInput ref={e => this.pin = e} onChange={e => this.setState({ pinInput: e })} length={6} focus type='numeric' inputMode='numeric' secret />
                                            <p ref={this.errorMessage} className='text-danger'></p>

                                        </div>
                                        <div className='row m-t-30'>
                                            <div className='col-md-12'>
                                                <button type='button' className='btn btn-primary btn-md btn-block waves-effect waves-light text-center m-b-10' onClick={this.onSubmit}>
                                                    Confirm
                                                </button>
                                            </div>
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
export default connect(mapStateToProps, mapActionsToProps)(PinAuthenPage);