import React from 'react';
import { AdminModal, AdminPage, FormSelect, FormTabs, FormTextBox, getValue, renderTable, TableCell } from 'view/component/AdminPage';
import T from 'view/js/common';

class EditModal extends AdminModal {

    onShow = (item) => {
        this.setState({ uid: item.uid });
        this.type.value(this.props.data[item.type]);
    }

    onSubmit = () => {
        const data = {
            userId: getValue(this.uid),
            cn: getValue(this.cn),
            sn: getValue(this.sn),
            mail: getValue(this.mail),
            type: getValue(this.type),
            password: getValue(this.password)
        };
        this.state.uid ? this.props.update(this.state.uid, data) : this.props.create(data, this.hide);
    }
    render() {
        const title = this.state.uid ? 'Điều chỉnh' : 'Thêm mới';
        return this.renderModal({
            title: title + ' thông tin định danh',
            body: <div className='row'>
                <FormSelect ref={e => this.type = e} label='Type' className='col-md-12' data={this.props.data} required />
                <FormTextBox ref={e => this.uid = e} label='User ID' className='col-md-12' required />
                <FormTextBox ref={e => this.cn = e} label='Common name' className='col-md-6' required />
                <FormTextBox ref={e => this.sn = e} label='Surname' className='col-md-6' required />
                <FormTextBox ref={e => this.mail = e} label='Email' className='col-md-12' required />
                <FormTextBox type='password' ref={e => this.password = e} label='Password' className='col-md-12' required />
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
                        T.get('/api/users/all', { types: result.data }, res => {
                            if (res.error) {
                                T.notify('Lỗi lấy dữ liệu định danh', 'danger');
                            } else {
                                this.setState({ items: res.items });
                            }
                        });
                    }
                });
            }
        });
    }
    createUser = (data, done) => {
        T.post('/api/users', { data }, result => {
            if (result.error) {
                T.notify('Có lỗi tạo user mới', 'danger');
            } else {
                T.notify('Tạo user mới thành công', 'success');
                this.getData();
                done && done();
            }
        });
    }

    render() {
        let { items, types } = this.state;
        const tableByType = (type) => renderTable({
            emptyTable: 'Chưa có dữ liệu người dùng',
            getDataSource: () => items[type],
            renderHead: () => <tr>
                <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                <th style={{ width: '40%' }}>User ID</th>
                <th style={{ width: '30%' }}>Common name</th>
                <th style={{ width: '30%' }}>Surname</th>
                <th style={{ width: 'auto' }}>Email</th>
            </tr>,
            renderRow: (item, index) =>
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell content={item.uid} />
                    <TableCell content={item.cn} />
                    <TableCell content={item.sn} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mail} />
                </tr>
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
                <EditModal ref={e => this.modal = e} data={types} create={this.createUser} />
            </>,
            onCreate: e => e.preventDefault() || this.modal.show({ type: this.tab.selectedTabIndex() })
        });
    }
}