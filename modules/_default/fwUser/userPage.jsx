import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, FormTextBox, getValue } from 'view/component/AdminPage';
import T from 'view/js/common';
import PinInput from 'react-pin-input';

class ChangePassword extends AdminModal {

    onSubmit = () => {
        let data = {
            oldPassword: getValue(this.oldPassword),
            newPassword: getValue(this.newPassword),
            newPasswordRecap: getValue(this.newPasswordRecap)
        };
        if (data.newPassword !== data.newPasswordRecap) {
            T.notify('Nhập lại mật khẩu mới không đúng', 'danger');
        } else {
            this.props.changePassword(data, this.hide);
        }
    }
    render() {
        return this.renderModal({
            title: 'Đổi mật khẩu',
            body: <div className='row'>
                <FormTextBox className='col-md-12' type='password' ref={e => this.oldPassword = e} label='Nhập mật khẩu cũ' required />
                <FormTextBox className='col-md-12' type='password' ref={e => this.newPassword = e} label='Nhập mật khẩu mới' required />
                <FormTextBox className='col-md-12' type='password' ref={e => this.newPasswordRecap = e} label='Nhập laị mật khẩu mới' required />
            </div>
        });
    }
}
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

    changePassword = (data, done) => {
        console.log(data);
        T.post('/api/user/change-password', { data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Thay đổi thất bại!', 'danger');
                console.error(result.error);
            } else {
                T.notify('Thay đổi thành công', 'success');
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
                                    <a href='#' className='text-primary' onClick={e => e.preventDefault() || this.changePassModal.show(this.state.uid)} >Đổi mật khẩu</a>
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
                <PINModal ref={e => this.modal = e} create={this.createPin} />
                <ChangePassword ref={e => this.changePassModal = e} changePassword={this.changePassword} />
            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(UserPage);