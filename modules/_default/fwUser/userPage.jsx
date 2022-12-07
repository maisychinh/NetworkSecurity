import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, FormTextBox } from 'view/component/AdminPage';
import T from 'view/js/common';
import PinInput from 'react-pin-input';

class PINModal extends AdminModal {
    componentDidMount() {
        this.onShown(() => this.pin.focus());
    }

    onShow = (uid) => {
        this.setState({ uid });
    }
    onSubmit = () => {
        if (!this.state.pinInput || this.state.pinInput.length != 6) {
            T.notify('Mã PIN không hợp lệ', 'danger');
            this.pin.focus();
        } else {
            let data = {
                pinCode: this.state.pinInput
            };
            this.props.create(data, this.hide);
        }

    }
    render() {
        return this.renderModal({
            title: 'Cài đặt mã PIN',
            body: <div style={{ textAlign: 'center' }}>
                <PinInput ref={e => this.pin = e} onChange={e => this.setState({ pinInput: e })} length={6} focus type='numeric' inputMode='numeric' />
            </div>
        });
    }
}
export class UserPage extends AdminPage {
    state = { items: [] }
    typeUserMapper = {
        'outsider': 'Khách',
        'staff': 'Cán bộ',
        'student': 'Học viên'
    }
    componentDidMount() {
        T.ready();
        let user = this.props.system?.user;

        if (!user.authen) {
            window.location = '/pin-authen';
        } else T.get('/api/user/info', result => {
            if (result.error) {
                if (result.error.message == 'request-login') {
                    window.location.href = '/';
                } else {
                    T.notify(result.error.message || 'Lỗi lấy thông tin người dùng', 'danger');
                }
            } else {
                this.setState({ pin: result.pin });
                let { uid, email, cn, sn, type } = result;
                this.setState({ uid });
                this.uid.value(uid || '');
                this.email.value(email || '');
                this.name.value(`${cn || ''} ${sn || ''}`);
                this.type.value(this.typeUserMapper[type.replace('ou=', '')]);
            }
        });
    }

    createPin = (data, done) => {
        T.post('/api/user/pin', { data }, result => {
            if (result.error) {
                T.notify('Lỗi khi tạo mã PIN', 'danger');
            } else {
                T.notify('Tạo mã mới PIN thành công', 'success');
                done && done();
            }
        });
    }

    render() {
        return this.renderPage({
            title: 'Trang cá nhân',
            content: <>
                <div className='card'>
                    <div className='card-header'>
                        <h5>Thông tin định danh</h5>
                        <span>Các trường thông tin dưới đây là mặc định cho bạn. Nếu muốn thay đổi vui lòng liên hệ quản trị viên.</span>
                    </div>
                    <div className='card-block'>
                        <div className='row'>
                            <FormTextBox ref={e => this.uid = e} label='Mã người dùng' className='col-md-3' readOnly />
                            <FormTextBox ref={e => this.email = e} label='Địa chỉ Email' className='col-md-3' readOnly />
                            <FormTextBox ref={e => this.name = e} label='Họ và tên' className='col-md-3' readOnly />
                            <FormTextBox ref={e => this.type = e} label='Vai trò' className='col-md-3' readOnly />
                        </div>
                    </div>
                </div>

                <div className='card'>
                    <div className='card-header'>
                        <h5>Cài đặt</h5>
                    </div>
                    <div className='card-block'>
                        <div className='row'>
                            <ol>
                                <li className='text-primary'>
                                    <a href='#' className='text-primary' onClick={e => e.preventDefault() || this.modal.show(this.state.uid)} >{this.state.pin ? 'Cập nhật' : 'Cài đặt'} mã PIN</a>
                                </li>
                                <li className='text-primary'>
                                    <a href='#' className='text-primary' onClick={e => e.preventDefault() || this.modal.show(this.state.uid)} >Đổi mật khẩu</a>
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
                <PINModal ref={e => this.modal = e} create={this.createPin} />
            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(UserPage);