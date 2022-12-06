import React from 'react';
import { AdminPage, FormTextBox } from 'view/component/AdminPage';
import T from 'view/js/common';

export default class UserPage extends AdminPage {
    state = { items: [] }
    typeUserMapper = {
        'outsider': 'Khách',
        'staff': 'Cán bộ',
        'student': 'Học viên'
    }
    componentDidMount() {
        T.ready();
        T.get('/api/user/info', result => {
            if (result.error) {
                if (result.error.message == 'request-login') {
                    window.location.href = '/';
                } else {
                    T.notify(result.error.message || 'Lỗi lấy thông tin người dùng', 'danger');
                }
            } else {
                let { uid, email, cn, sn, type } = result;
                this.uid.value(uid || '');
                this.email.value(email || '');
                this.name.value(`${cn || ''} ${sn || ''}`);
                this.type.value(this.typeUserMapper[type.replace('ou=', '')]);
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
                </div>
            </>,
        });
    }
}