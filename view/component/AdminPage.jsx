import './adminPage.scss';
import React from 'react';
import { Link } from 'react-router-dom';
// import ImageBox from 'view/component/ImageBox';
// import FileBox from 'view/component/FileBox';
// import Editor from 'view/component/CkEditor4';
import Datetime from 'react-datetime';
import InputMask from 'react-input-mask';
import 'react-datetime/css/react-datetime.css';
import Tooltip from '@mui/material/Tooltip';
import FormTextBox from './form/FormTextBox';
import FormSelect from './form/FormSelect';
import FormCheckbox from './form/FormCheckbox';
import CirclePageButton from './form/CirclePageButton';

export { FormTextBox, FormSelect, FormCheckbox, CirclePageButton };

// Table components ---------------------------------------------------------------------------------------------------
export class TableCell extends React.Component {
    // type = number | date | link | image | checkbox | buttons | text (default)
    state = { checked: false };
    componentDidMount() {
        $(document).ready(() => {
            if (this.props.type == 'checkbox' && !this.props.isCheck) {
                this.switch = new Switchery(this.checkbox, { color: '#01a9ac', jackColor: '#fff', size: 'small' });
                this.checkbox.onchange = () => this.onCheckBoxCheck();
                this.switch.setValue(!!this.props.content);
            }
        });
    }

    onCheckBoxCheck = () => { // For checkBox only
        if (this.props.permission && this.props.permission.write) {
            this.switch.setValue(!this.props.content);
            this.props.onChanged && this.props.onChanged(!this.props.content);
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.content !== undefined || this.props.content !== prevProps.content) {
            // this.switch = new Switchery(this.checkbox, { color: '#01a9ac', jackColor: '#fff', size: 'small' });
            // this.checkbox.onchange = () => this.onCheckBoxCheck();
            // this.switch.setValue(!!this.props.content);
        }
    }

    render() {
        let { type = 'text', content = '', permission = {}, className = '', style = {}, contentStyle = {}, alt = '', display = true, rowSpan = 1, colSpan = 1, dateFormat, contentClassName = '', onClick = null, nowrap = false } = this.props;
        if (style == null) style = {};
        if (nowrap) style = { whiteSpace: 'nowrap' };
        if (display != true) {
            return null;
        } else if (type == 'number') {
            return (
                <td className={className} style={{ textAlign: 'right', ...style }} rowSpan={rowSpan} colSpan={colSpan}>
                    {content && !isNaN(content) ? T.numberDisplay(content) : content}
                </td>
            );
        } else if (type == 'date') {
            return (
                <td className={className} style={{ ...style }} rowSpan={rowSpan} colSpan={colSpan}>
                    {content
                        ? dateFormat
                            ? T.dateToText(content, dateFormat)
                            : new Date(content).getText()
                        : ''}
                </td>
            );
        } else if (type == 'link') {
            let url = this.props.url ? this.props.url.trim() : '',
                onClick = this.props.onClick;
            if (onClick) {
                return (
                    <td className={className} style={{ ...style }} rowSpan={rowSpan} colSpan={colSpan}>
                        <a href='#' style={contentStyle} onClick={(e) => e.preventDefault() || onClick(e)}>
                            {content}
                        </a>
                    </td>
                );
            } else {
                return url.startsWith('http://') || url.startsWith('https://') ? (
                    <td className={className} style={{ textAlign: 'left', ...style }} rowSpan={rowSpan} colSpan={colSpan}>
                        <a href={url} target='_blank' rel='noreferrer' style={contentStyle}>
                            {content}
                        </a>
                    </td>
                ) : (
                    <td className={className} style={{ textAlign: 'left', ...style }} rowSpan={rowSpan} colSpan={colSpan}>
                        <Link to={url} style={contentStyle}>
                            {content}
                        </Link>
                    </td>
                );
            }
        } else if (type == 'image') {
            return content ? (
                <td style={{ textAlign: 'center', ...style }} className={className} rowSpan={rowSpan} colSpan={colSpan}>
                    <img src={content} alt={alt} style={{ height: this.props.height || '32px' }} />
                </td>
            ) : (
                <td style={{ textAlign: 'center', ...style }} className={className} rowSpan={rowSpan} colSpan={colSpan}>
                    {alt}
                </td>
            );
        } else if (type == 'checkbox') {
            return this.props.isCheck ? (
                <td className={'animated-checkbox ' + className} style={{ textAlign: 'center', ...style }} rowSpan={rowSpan} colSpan={colSpan}>
                    <label>
                        <input type='checkbox' checked={content} onChange={() => permission.write && this.props.onChanged(!content)} />
                        <span className={'label-text'} />
                    </label>
                </td>
            ) : (
                <td style={{ textAlign: 'center', ...style }} className={className} rowSpan={rowSpan} colSpan={colSpan}>
                    <input type='checkbox' ref={e => this.checkbox = e} />
                </td>
            );
        } else if (type == 'buttons') {
            const { onSwap, onEdit, onDelete, children } = this.props;
            return (
                <td className={className} style={{ ...style }} rowSpan={rowSpan} colSpan={colSpan}>
                    <div className='btn-group d-flex'>
                        {children}
                        {permission.write && onSwap ? (
                            <button className='btn btn-sm btn-warning' onClick={(e) => e.preventDefault() || onSwap(e, content, true)}><i className='icofont icofont-arrow-up' /></button>
                        ) : null}
                        {permission.write && onSwap ? (
                            <button className='btn btn-sm btn-warning' onClick={(e) => e.preventDefault() || onSwap(e, content, true)}><i className='icofont icofont-arrow-down' /></button>
                        ) : null}
                        {onEdit && typeof onEdit == 'function' ? (
                            <Tooltip title={permission.write ? 'Chỉnh sửa' : 'Xem'} arrow placeholder='bottom'>
                                <button className='btn btn-sm btn-primary' onClick={(e) => e.preventDefault() || onEdit(e, content)}>
                                    <i className={'icofont ' + (permission.write ? 'icofont-edit' : 'icofont-eye-alt')} />
                                </button>
                            </Tooltip>
                        ) : null}
                        {onEdit && typeof onEdit == 'string' ? (
                            <Tooltip title='Chỉnh sửa' arrow placeholder='bottom'>
                                <Link to={onEdit} style={{ lineHeight: '22px' }} className='btn btn-sm btn-primary'><i className='icofont icofont-edit' /></Link>
                            </Tooltip>
                        ) : null}
                        {permission.delete && onDelete ? (
                            <Tooltip title='Xóa' arrow placeholder='bottom'>
                                <button className='btn btn-sm btn-danger' onClick={(e) => e.preventDefault() || onDelete(e, content)}><i className='icofont icofont-trash' /></button>
                            </Tooltip>
                        ) : null}
                    </div>
                </td>
            );
        } else {
            return (
                <td className={className} style={{ ...style }} rowSpan={rowSpan} colSpan={colSpan} onClick={onClick}>
                    <div style={contentStyle} className={contentClassName}>
                        {content}
                    </div>
                </td>
            );
        }
    }
}

export function renderTable({ style = {}, className = '', getDataSource = () => null, emptyTable = 'Chưa có dữ liệu!', renderHead = () => null, renderRow = () => null, header = 'thead-dark' }) {
    const list = getDataSource();
    if (list == null) {
        return (
            <div className='preloader3 loader-block'>
                <div className='circ1 loader-default' />
                <div className='circ2 loader-default' />
                <div className='circ3 loader-default' />
                <div className='circ4 loader-default' />
            </div>
        );
    } else if (list.length) {
        return (
            <div className='table-responsive'>
                <table className={'table table-bordered table-striped ' + className} style={{ marginBottom: 0, ...style }}>
                    <thead className={header}>{renderHead()}</thead>
                    <tbody>
                        {typeof renderRow == 'function' ? list.map(renderRow) : renderRow}
                    </tbody>
                </table>
            </div>);
    } else {
        return <b>{emptyTable}</b>;
    }
}

export const loadSpinner = () => {
    return (
        <div className='card'>
            <div className='preloader3 loader-block'>
                <div className='circ1 loader-default' />
                <div className='circ2 loader-default' />
                <div className='circ3 loader-default' />
                <div className='circ4 loader-default' />
            </div>
        </div>);
};

// Form components ----------------------------------------------------------------------------------------------------
export class FormTabs extends React.Component {
    randomKey = T.randomPassword(8);
    state = { tabIndex: 0 };

    componentDidMount() {
        $(document).ready(() => {
            let tabIndex = parseInt(T.cookie(this.props.id || 'tab'));
            if (
                isNaN(tabIndex) ||
                tabIndex < 0 ||
                tabIndex >= $(this.tabs).children().length
            )
                tabIndex = 0;
            this.setState({ tabIndex }, () => {
                setTimeout(() => {
                    this.props.onChange && this.props.onChange({ tabIndex });
                }, 250);
            });
        });
    }

    onSelectTab = (e, tabIndex) => {
        e.preventDefault();
        T.cookie(this.props.id || 'tab', tabIndex);
        this.setState(
            { tabIndex },
            () => this.props.onChange && this.props.onChange({ tabIndex })
        );
    };

    selectedTabIndex = () => this.state.tabIndex;

    tabClick = (e, index) => {
        e && e.preventDefault();
        $(`a[href='#${this.props.id || 'tab'}_${index}${this.randomKey}']`).click();
    };

    render() {
        const {
            style = {},
            tabClassName = '',
            contentClassName = '',
            tabs = [],
            header = null
        } = this.props,
            id = this.props.id || 'tab',
            tabLinks = [],
            tabPanes = [];
        tabs.forEach((item, index) => {
            const tabId = id + '_' + index + this.randomKey,
                className = index == this.state.tabIndex ? ' active show' : '';
            tabLinks.push(
                <li key={index} className={'nav-item'}>
                    <a className={'nav-link' + className} data-toggle='tab' href={'#' + tabId} onClick={(e) => this.onSelectTab(e, index)}>
                        {item.title}
                    </a>
                </li>
            );
            tabPanes.push(
                <div key={index} className={'tab-pane fade' + className} id={tabId}>
                    {item.component}
                </div>
            );
        });

        return (
            <div style={style}>
                <ul ref={(e) => (this.tabs = e)} className={'nav nav-tabs ' + tabClassName}>
                    {tabLinks}
                </ul>
                <div className={'tab-content ' + contentClassName} style={{ position: 'relative' }}>
                    {header}
                    {tabPanes}
                </div>
            </div>
        );
    }
}

export class FormRichTextBox extends React.Component {
    static defaultProps = { formType: 'richTextBox' };
    state = { value: '' };

    value = (text) => {
        if (text === '' || text) {
            this.setState({ value: text });
        } else {
            return this.state.value;
        }
    };

    focus = () => this.input.focus();

    clear = () => this.input.clear();

    render() {
        const {
            style = {},
            rows = 3,
            label = '',
            placeholder = '',
            className = '',
            readOnly = false,
            onChange = null,
            required = false,
            readOnlyEmptyText = '',
            icon = ''
        } = this.props;
        let displayElement = '';
        if (label) {
            displayElement = (
                <>
                    <label onClick={() => this.input.focus()}>
                        {label}
                        {!readOnly && required ? (
                            <span style={{ color: 'red' }}> *</span>
                        ) : (
                            ''
                        )}
                    </label>
                    {readOnly && this.state.value ? (
                        <>
                            : <br /> <b>{this.state.value}</b>
                        </>
                    ) : readOnly && readOnlyEmptyText ? (
                        <b>{readOnlyEmptyText}</b>
                    ) : (
                        ''
                    )}
                </>
            );
        } else {
            displayElement = readOnly ? <b>{this.state.value}</b> : '';
        }
        return (
            <div className={'form-group ' + (className ? className : '')} style={style}>
                {displayElement}
                <textarea ref={(e) => (this.input = e)} className='form-control' style={{ display: readOnly ? 'none' : 'block', position: 'relative' }} placeholder={placeholder ? placeholder : label} value={this.state.value} rows={rows} onChange={(e) =>
                    this.setState({ value: e.target.value }) ||
                    (onChange && onChange(e))
                } />
                {icon}
            </div>
        );
    }
}

// export class FormEditor extends React.Component {
//     static defaultProps = { formType: 'editor' }
//     state = { value: '' };
//
//     html = (text) => {
//         if (text === '' || text) {
//             this.input.html(text);
//             this.setState({ value: text });
//         } else {
//             return this.input.html();
//         }
//     }
//
//     value = this.html;
//
//     text = () => this.input.text();
//
//     focus = () => this.input.focus();
//
//     render() {
//         let { height = '400px', label = '', className = '', readOnly = false, uploadUrl = '', smallText = '', required = false } = this.props;
//         className = 'form-group' + (className ? ' ' + className : '');
//         return (
//             <div className={className}>
//                 <label>{label}{!readOnly && required ? <span style={{ color: 'red' }}> *</span> : ''}</label>{readOnly && this.state.value ? <br /> : ''}
//                 <p style={{ width: '100%', fontWeight: 'bold', display: readOnly ? 'block' : 'none' }} dangerouslySetInnerHTML={{ __html: this.state.value }} />
//                 {!readOnly && smallText ? <small className='form-text text-muted'>{smallText}</small> : null}
//                 <div style={{ display: readOnly ? 'none' : 'block' }}>
//                     <Editor ref={e => this.input = e} height={height} placeholder={label} uploadUrl={uploadUrl} />
//                 </div>
//             </div>);
//     }
// }

export class FormDatePicker extends React.Component {
    static defaultProps = { formType: 'datePicker', type: 'date' };

    mask = {
        'time-mask': '39/19/2099 h9:59',
        'date-mask': '39/19/2099',
        'year-mask': '2099',
        'month-mask': '19/2099',
        'date-month': '39/19'
    };

    format = {
        'time-mask': 'dd/mm/yyyy HH:MM',
        'date-mask': 'dd/mm/yyyy',
        'month-mask': 'mm/yyyy',
        'year-mask': 'yyyy',
        'date-month': 'dd/mm'
    };

    state = { value: '', readOnlyText: '' };

    value = function (date) {
        const type = this.props.type;
        if (arguments.length) {
            if (type == 'date-month') {
                const value = date
                    ? T.dateToText(new Date(date), this.format[type])
                    : '';
                this.setState({ value, readOnlyText: value });
            } else if (type.endsWith('-mask')) {
                const value = date
                    ? T.dateToText(new Date(date), this.format[type])
                    : '';
                this.setState({ value, readOnlyText: value });
            } else {
                this.setState({
                    value: date ? new Date(date) : '',
                    readOnlyText: date
                        ? T.dateToText(
                            new Date(date),
                            type == 'date'
                                ? 'dd/mm/yyyy'
                                : type == 'dd/mm'
                                    ? 'dd/mm'
                                    : 'dd/mm/yyyy HH:MM'
                        )
                        : ''
                });
            }
        } else {
            if (type == 'date-month') {
                const date = T.formatDate(this.state.value + '/' + this.props.year);
                if (date == null || Number.isNaN(date.getTime())) return '';
                return date;
            } else if (type.endsWith('-mask')) {
                const date = T.formatDate(
                    (type == 'month-mask' ? '01/' : type == 'year-mask' ? '01/01/' : '') +
                    this.state.value
                );
                if (date == null || Number.isNaN(date.getTime())) return '';
                return date;
            } else {
                return this.state.value;
            }
        }
    };

    focus = () => {
        const type = this.props.type;
        if (type == 'date-month') {
            this.input.getInputDOMNode().focus();
        } else if (type.endsWith('-mask')) {
            this.input.getInputDOMNode().focus();
        } else {
            $(this.inputRef).focus();
        }
    };

    handleChange = (event) => {
        const type = this.props.type;
        event.preventDefault && event.preventDefault();
        this.setState(
            {
                value:
                    type.endsWith('-mask') || type == 'date-month'
                        ? event.target.value
                        : new Date(event)
            },
            () => {
                this.props.onChange && this.props.onChange(this.value());
            }
        );
    };

    render() {
        let {
            label = '',
            type = 'date',
            className = '',
            readOnly = false,
            required = false,
            style = {},
            readOnlyEmptyText = '',
            placeholder = '',
            disabled = false
        } = this.props; // type = date || time || date-mask || time-mask || month-mask
        return (
            <div className={'form-group ' + (className || '')} style={style}>
                {label && (
                    <label onClick={() => this.focus()}>
                        {label}
                        {!readOnly && required ? (
                            <span style={{ color: 'red' }}> *</span>
                        ) : (
                            ''
                        )}
                    </label>
                )}
                {readOnly && this.state.value ? (
                    <>
                        {' '}
                        {label && ':'} <b>{this.state.readOnlyText}</b>
                    </>
                ) : (
                    readOnly && readOnlyEmptyText && <b>: {readOnlyEmptyText}</b>
                )}
                {type.endsWith('-mask') || type == 'date-month' ? (
                    <InputMask ref={(e) => (this.input = e)} className='form-control' mask={this.mask[type]} onChange={this.handleChange} style={{ display: readOnly ? 'none' : '' }} formatChars={{
                        2: '[12]',
                        0: '[089]',
                        1: '[01]',
                        3: '[0-3]',
                        9: '[0-9]',
                        5: '[0-5]',
                        h: '[0-2]'
                    }} value={this.state.value} readOnly={readOnly} placeholder={placeholder || label} />
                ) : (
                    <Datetime ref={(e) => (this.input = e)} timeFormat={type == 'time' ? 'HH:mm' : false} dateFormat={type == 'dd/mm' ? 'DD/MM' : 'DD/MM/YYYY'} inputProps={{
                        placeholder: placeholder || label,
                        ref: (e) => (this.inputRef = e),
                        readOnly: readOnly,
                        disabled,
                        style: { display: readOnly ? 'none' : '' }
                    }} value={this.state.value} onChange={(e) => this.handleChange(e)} closeOnSelect={true} />
                )}
            </div>
        );
    }
}

// export class FormImageBox extends React.Component {
//     setData = (data, image) => this.imageBox.setData(data, image);
//
//     render() {
//         let { label = '', className = '', style = {}, boxUploadStye = {}, readOnly = false, postUrl = '/user/upload', uploadType = '', image = null, onDelete = null, onSuccess = null, isProfile = null, description = null, height = '' } = this.props;
//         return (
//             <div className={'form-group ' + className} style={style} >
//                 <label>{label}&nbsp;</label>
//                 {!readOnly && image && onDelete ?
//                     <a href='#' className='text-danger' onClick={onDelete}><i className='fa fa-fw fa-lg fa-trash' /></a> : null}
//                 <ImageBox ref={e => this.imageBox = e} postUrl={postUrl} uploadType={uploadType} image={image} readOnly={readOnly} success={data => onSuccess && onSuccess(data)} isProfile={isProfile} description={description} style={boxUploadStye} height={height} />
//             </div>);
//     }
// }

// export class FormFileBox extends React.Component {
//     setData = (data, reset = true) => this.fileBox.setData(data, reset);
//
//     render() {
//         let { label = '', className = '', pending = false, style = {}, readOnly = false, postUrl = '/user/upload', uploadType = '', onDelete = null, onSuccess = null, onDownload = null, description = null, accept = '', background = '' } = this.props;
//         return (
//             <div className={'form-group ' + className} style={style}>
//                 {label && <label>{label}&nbsp;</label>}
//                 {!readOnly && onDelete ? <a href='#' className='text-danger' onClick={onDelete}><i className='fa fa-fw fa-lg fa-trash' /></a> : null}
//                 {!readOnly && onDownload ? <a href='#' className='text-success' style={{ float: 'right' }} onClick={onDownload}><i className='fa fa-fw fa-lg fa-download' /></a> : null}
//                 <FileBox ref={e => this.fileBox = e} pending={pending} postUrl={postUrl} uploadType={uploadType} readOnly={readOnly} success={data => onSuccess && onSuccess(data)} description={description} accept={accept} background={background} />
//             </div>);
//     }
// }

export function getValue(input) {
    const data = input.value();
    if (!input.props || !input.props.required) return data;
    const formType = input.props.formType;
    switch (formType) {
        case 'textBox': {
            if ((data && data !== '') || data === 0) return data;
            throw input;
        }

        case 'richTextBox':
        case 'editor':
        case 'datePicker': {
            if (data && data !== '') return data;
            throw input;
        }

        case 'selectBox': {
            const multiple = input.props.multiple || false;
            if (!!multiple && data && Array.isArray(data) && data.length) return data;
            if (!multiple && data) return data;
            throw input;
        }

        default:
            return data;
    }
}

// Page components ----------------------------------------------------------------------------------------------------
export class AdminModal extends React.Component {
    state = { display: '' };
    _data = {};

    componentWillUnmount() {
        this.hide();
    }

    onShown = (modalShown) => {
        $(this.modal).on('shown.bs.modal', () => modalShown());
    };

    onHidden = (modalHidden) => {
        $(this.modal).on('hidden.bs.modal', () => modalHidden());
    };

    show = (item, multiple = null) => {
        if (this.onShow) {
            if (multiple != null) this.onShow(item, multiple);
            else this.onShow(item);
        }
        $(this.modal).modal('show');
    };

    hide = () => {
        this.onHide && this.onHide();
        $(this.modal).modal('hide');
    };

    data = (key, value) => {
        if (value === '' || value) {
            this._data[key] = value;
        } else {
            return this._data[key];
        }
    };

    submit = (e) => {
        try {
            this.onSubmit(e);
        } catch (input) {
            if (input && input.props) {
                T.notify((input.props.label || 'Dữ liệu') + ' bị trống!', 'danger');
                input.focus();
            }
        }
    };

    disabledClickOutside = () => {
        $(this.modal).modal({ backdrop: 'static', keyboard: false, show: false });
    };

    renderModal = ({ title, body, size, buttons, postButtons, isLoading = false, submitText = 'Lưu', isShowSubmit = true, style = {}, showCloseButton = true }) => {
        const { readOnly = false } = this.props;
        return (
            <div className='modal fade' role='dialog' ref={(e) => (this.modal = e)} style={style}>
                <form className={'modal-dialog' + (size == 'large' ? ' modal-lg' : size == 'elarge' ? ' modal-xl' : '')} role='document' onSubmit={(e) => { e.preventDefault() || (this.onSubmit && this.submit(e)); }}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>{title}</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>{body}</div>
                        <div className='modal-footer'>
                            {buttons}
                            <button type='button' className='btn btn-secondary' data-dismiss='modal' style={{ display: showCloseButton ? '' : 'none' }}>
                                <i className='icofont icofont-close' /> Đóng
                            </button>
                            {postButtons}
                            {!isShowSubmit || readOnly == true || !this.onSubmit ? null : (
                                <button type='submit' className='btn btn-primary' disabled={isLoading}>
                                    {isLoading ? (
                                        <i className='fa fa-spin fa-spinner' />
                                    ) : (
                                        <i className='icofont icofont-save' />
                                    )}{' '}
                                    {submitText}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        );
    };
}

export class AdminPage extends React.Component {
    componentWillUnmount() {
        T.onSearch = null;
        T.onAdvanceSearchHide = null;

        this.willUnmount();
    }

    willUnmount = () => { };

    getCurrentPermissions = () =>
        this.props.system &&
            this.props.system.user &&
            this.props.system.user.permissions
            ? this.props.system.user.permissions
            : [];

    getUserPermission = (
        prefix,
        listPermissions = ['read', 'write', 'delete']
    ) => {
        const permission = {},
            currentPermissions = this.getCurrentPermissions();
        listPermissions.forEach(
            (item) =>
                (permission[item] = currentPermissions.includes(`${prefix}:${item}`))
        );
        return permission;
    };

    // showAdvanceSearch = () => $(this.advanceSearchBox).addClass('show');

    // hideAdvanceSearch = () => {
    //     $(this.advanceSearchBox).removeClass('show');
    //     $(this.advanceSearchBox).addClass('hide');
    // }

    // renderPage = ({ icon, title, subTitle, header, breadcrumb, advanceSearch, advanceSearchTitle = 'Tìm kiếm nâng cao', content, backRoute, onCreate, onSave, onExport, onImport, buttons = null }) => {
    renderPage = ({ title, subTitle, breadcrumb, content, backRoute, onCreate, onSave, onExport, onImport, onRefresh, buttons = null }) => {
        T.title(title);

        let right = 10, createButton, saveButton, exportButton, importButton, customButtons;
        if (onCreate) {
            createButton = <CirclePageButton type='create' onClick={onCreate} style={{ right }} tooltip='Tạo mới' />;
            right += 60;
        }
        if (onSave) {
            saveButton = <CirclePageButton type='save' onClick={onSave} style={{ right }} tooltip='Lưu' />;
            right += 60;
        }
        if (onExport) {
            exportButton = <CirclePageButton type='export' onClick={onExport} style={{ right }} tooltip='Export' />;
            right += 60;
        }
        if (onImport) {
            importButton = <CirclePageButton type='import' onClick={onImport} style={{ right }} tooltip='Import' />;
            right += 60;
        }
        if (onRefresh) {
            importButton = <CirclePageButton type='refresh' onClick={onRefresh} style={{ right }} tooltip='Refresh' />;
            right += 60;
        }
        if (buttons) {
            if (Array.isArray(buttons)) {
                if (buttons.length)
                    customButtons = buttons.map((item, index) => {
                        if (item) {
                            right += 60;
                            return (
                                <CirclePageButton key={index} type='custom' customClassName={item.className} customIcon={item.icon} onClick={item.onClick} style={{ right: right - 60 }} tooltip={item.tooltip} />
                            );
                        }
                    });
            } else {
                customButtons = (
                    <CirclePageButton type='custom' customClassName={buttons.className} customIcon={buttons.icon} onClick={buttons.onClick} style={{ right: right }} />
                );
                right += 60;
            }
        }

        return (
            <div className='pcoded-inner-content'>
                <div className='main-body'>
                    <div className='page-wrapper'>
                        <div className='page-header'>
                            <div className='row align-items-end'>
                                <div className='col-lg-8'>
                                    <div className='page-header-title'>
                                        <div className='d-inline'>
                                            {title && <h4>{title}</h4>}
                                            {subTitle && <span>{subTitle}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className='col-lg-4'>
                                    <div className='page-header-breadcrumb'>
                                        <ul className='breadcrumb-title'>
                                            {breadcrumb != null && (
                                                <li className='breadcrumb-item'>
                                                    <Link to='/user'>
                                                        <i className='feather icon-home' />
                                                    </Link>
                                                </li>
                                            )}
                                            {breadcrumb != null
                                                ? breadcrumb.map((item, index) => (
                                                    <li key={index} className='breadcrumb-item'>
                                                        {item}
                                                    </li>
                                                ))
                                                : ''}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='page-body'>
                            {content}
                            {backRoute ? (
                                <CirclePageButton type='back' to={backRoute} />
                            ) : null}
                            {importButton} {exportButton} {saveButton} {createButton}{' '}
                            {customButtons}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    render() {
        return null;
    }
}
