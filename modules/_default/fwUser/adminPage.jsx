import React from 'react';
import { AdminModal, AdminPage, FormDatePicker, FormSelect, FormTabs, FormTextBox, getValue, renderTable, TableCell } from 'view/component/AdminPage';
import T from 'view/js/common';

class LogModal extends AdminModal {
    onShow = (uid) => {
        T.get('/api/admin/users/logs', { uid }, result => {
            this.setState({ logs: result.logs, data: result.data }, () => {
                this.lastPinTime.value(result.data?.lastModified || '');
            });
        });
    }
    render() {
        const logs = this.state.logs || [];
        const table = renderTable({
            getDataSource: () => logs,
            renderHead: () => <tr>
                <th style={{ width: 'auto' }}>#</th>
                <th style={{ width: '50%' }}>Method</th>
                <th style={{ width: '50%' }}>Time</th>
            </tr>,
            renderRow: (item, index) => <tr key={index}>
                <TableCell content={index + 1} />
                <TableCell content={item.method} />
                <TableCell type='date' dateFormat={'HH:MM:ss dd/mm/yyyy'} content={item.time} />
            </tr>
        });
        return this.renderModal({
            title: 'Log người dùng',
            body: <div className='row'>
                <FormDatePicker className='col-md-12' type='time' ref={e => this.lastPinTime = e} label='Lần cuối cập nhật mã PIN' readOnly />
                <div className='col-md-12' style={{ height: '70vh', overflow: 'scroll' }}>
                    {table}
                </div>
            </div>
        });
    }
}
class EditModal extends AdminModal {

    onShow = (item) => {
        this.type.value(this.props.data[item.type]);
        this.setState({ uid: item.uid }, () => {
            this.uid.value(item.uid || '');
            this.cn.value(item.cn || '');
            this.sn.value(item.sn || '');
            this.mail.value(item.mail || '');
        });
    }

    onSubmit = () => {
        const data = {
            uid: getValue(this.uid),
            cn: getValue(this.cn),
            sn: getValue(this.sn),
            mail: getValue(this.mail),
            type: getValue(this.type),
            password: this.password ? getValue(this.password) : null
        };
        if (!this.password) delete data.password;
        this.state.uid ? this.props.update(this.state.uid, data, this.hide) : this.props.create(data, this.hide);
    }
    render() {
        const action = this.state.uid ? 'Điều chỉnh' : 'Thêm mới';
        return this.renderModal({
            title: action + ' thông tin định danh',
            body: <div className='row'>
                <FormSelect ref={e => this.type = e} label='Type' className='col-md-12' data={this.props.data} required />
                <FormTextBox ref={e => this.uid = e} label='User ID' className='col-md-12' required />
                <FormTextBox ref={e => this.cn = e} label='Common name' className='col-md-6' required />
                <FormTextBox ref={e => this.sn = e} label='Surname' className='col-md-6' required />
                <FormTextBox ref={e => this.mail = e} label='Email' className='col-md-12' required />
                {this.state.uid ? <></> : <FormTextBox type='password' ref={e => this.password = e} label='Password' className='col-md-12' required />}
            </div>
        });
    }
}
export default class AdminUserPage extends AdminPage {
    state = { items: [] }
    componentDidMount() {
        T.ready();
        this.getData();
    }

    getData = () => {
        T.get('/api/system', result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu định danh', 'danger');
            } else {
                this.setState({ types: result.data }, () => {
                    if (this.state.types.length) {
                        T.get('/api/admin/users/all', { types: result.data }, res => {
                            if (res.error) {
                                T.notify(res.error.message || 'Lỗi lấy dữ liệu định danh', 'danger');
                            } else {
                                this.setState({ items: res.items, logs: res.logs });
                            }
                        });
                    }
                });
            }
        });
    }

    createUser = (data, done) => {
        T.post('/api/admin/users', { data }, result => {
            if (result.error) {
                T.notify('Có lỗi tạo user mới', 'danger');
            } else {
                T.notify('Tạo user mới thành công', 'success');
                this.getData();
                done && done();
            }
        });
    }

    updateUser = (userId, changes, done) => {
        T.put('/api/admin/users', { userId, changes }, result => {
            if (result.error) {
                T.notify('Có lỗi khi cập nhật người dùng', 'danger');
            } else {
                T.notify('Cập nhật người dùng thành công', 'success');
                this.getData();
                done && done();
            }
        });
    }

    deleteUser = (item, done) => {
        T.confirm('Xác nhận', `Bạn muốn xoá người dùng ID: ${item.uid}`, 'warning', true, isConfirm => {
            isConfirm && T.delete(`/api/admin/users/${this.state.types[this.tab.selectedTabIndex()]}/${item.uid}`, result => {
                if (result.error) {
                    T.notify('Có lỗi khi xoá người dùng', 'danger');
                } else {
                    T.notify('Xoá người dùng thành công', 'success');
                    this.getData();
                    done && done();
                }
            });
        });
    }

    render() {
        let { items, types, logs } = this.state;
        const tableByType = (type) => renderTable({
            emptyTable: 'Chưa có dữ liệu người dùng',
            getDataSource: () => items[type],
            renderHead: () => <tr>
                <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                <th style={{ width: '40%' }}>User ID</th>
                <th style={{ width: '30%' }}>Common name</th>
                <th style={{ width: '30%' }}>Surname</th>
                <th style={{ width: 'auto' }}>Email</th>
                <th style={{ width: 'auto' }}>Last login</th>
                <th style={{ width: 'auto' }}>User log</th>
                <th style={{ width: 'auto' }}>Actions</th>
            </tr>,
            renderRow: (item, index) => {
                let log = (logs || []).find(log => log.uid == item.uid);
                return (<tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell content={item.uid} />
                    <TableCell content={item.cn} />
                    <TableCell content={item.sn} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mail} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={log ? `${log.method}: ${T.dateToText(log.time, 'HH:MM:ss dd/mm/yyyy')}` : ''} />
                    <TableCell style={{ textAlign: 'center' }} content={
                        <button className='btn btn-sm btn-warning' onClick={e => e.preventDefault() || this.logModal.show(item.uid)}>
                            <i className='icofont icofont-listing-box' />
                        </button>
                    } />
                    <TableCell type='buttons' onEdit={() => { this.modal.show({ ...item, type: this.tab.selectedTabIndex() }); }} onDelete={() => this.deleteUser(item)} permission={{ write: true, delete: true }} />
                </tr>);
            }
        });

        return this.renderPage({
            title: 'Dashboard',
            content: <>
                {types && types.length ? <FormTabs ref={e => this.tab = e} tabs={
                    types.map(type => ({
                        title: type,
                        component: <div className='card'>
                            {tableByType(type)}
                        </div>
                    }))
                } /> : <div>Chưa có dữ liệu định danh nào!</div>}
                <EditModal ref={e => this.modal = e} data={types} create={this.createUser} update={this.updateUser} />
                <LogModal ref={e => this.logModal = e} />
            </>,
            onCreate: e => e.preventDefault() || this.modal.show({ type: this.tab.selectedTabIndex() })
        });
    }
}