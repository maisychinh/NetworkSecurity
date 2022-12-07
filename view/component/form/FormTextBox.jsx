import React from 'react';
import InputMask from 'react-input-mask';
import NumberFormat from 'react-number-format';

class FormNumberBox extends React.Component {
    exactValue = null;
    state = { value: '' };

    value = function (text) {
        if (arguments.length) {
            this.exactValue = null;
            this.setState({ value: text }, () => {
                if (this.exactValue == null) this.exactValue = this.state.value;
            });
        } else {
            return this.exactValue;
        }
    }

    focus = () => this.input.focus();

    checkMinMax = (val) => {
        const { min = '', max = '' } = this.props;
        if (!isNaN(parseFloat(min)) || !isNaN(parseFloat(max))) { // Có properties min hoặc max
            if (!isNaN(parseFloat(min)) && val < parseFloat(min)) { // Có properties min và val < min
                return min.toString();
            }
            if (!isNaN(parseFloat(max)) && val > parseFloat(max)) { // Có properties max và val > max
                return max.toString();
            }
            return false;
        } else {
            return false;
        }
    }

    render() {
        let { smallText = '', label = '', placeholder = '', className = '', style = {}, readOnly = false, onChange = null, required = false, step = false, prefix = '', suffix = '', onKeyPress = null, autoFormat = true, disabled } = this.props,
            readOnlyText = this.exactValue ? this.exactValue : this.state.value;
        const properties = {
            className: 'form-control',
            placeholder: label || placeholder,
            value: this.exactValue ? this.exactValue : this.state.value,
            thousandSeparator: autoFormat ? ',' : null,
            decimalSeparator: step ? '.' : false,
            onValueChange: val => {
                const newValue = this.checkMinMax(val.floatValue);
                if (newValue != false) {
                    this.setState({ value: newValue });
                } else {
                    this.exactValue = val.floatValue;
                    onChange && onChange(val.floatValue);
                }
            },
            onKeyPress: e => onKeyPress && onKeyPress(e),
            getInputRef: e => this.input = e
        };
        readOnlyText = readOnlyText ? T.numberDisplay(readOnlyText, ',') : '';
        let displayElement = '';
        if (label) {
            displayElement = <><label onClick={() => this.input.focus()}>{label}{!readOnly && required ? <span style={{ color: 'red' }}> *</span> : ''}</label>{readOnly ? <>: <b>{readOnlyText}</b></> : ''}</>;
        } else {
            displayElement = readOnly ? <b>{readOnlyText}</b> : '';
        }

        return (
            <div className={'form-group ' + (className || '')} style={style}>
                {displayElement}
                <NumberFormat disabled={disabled} prefix={prefix} suffix={suffix} style={{ display: readOnly ? 'none' : 'block' }} {...properties} />
                {smallText ? <small>{smallText}</small> : null}
            </div>);
    }
}

class FormYearBox extends React.Component {
    state = { value: '' };

    value = function (value) {
        if (arguments.length) {
            this.setState({ value: value.toString() });
        } else {
            return this.state.value.includes('_') ? '' : this.state.value;
        }
    }

    focus = () => this.input.getInputDOMNode().focus()

    handleChange = event => {
        event.preventDefault && event.preventDefault();
        this.setState({ value: event.target.value }, () => {
            this.props.onChange && this.props.onChange(this.state.value);
        });
    }

    mask = {
        'year': '2099',
        'scholastic': '2099 - 2099'
    };

    render() {
        let { smallText = '', label = '', placeholder = '', className = '', style = {}, readOnly = false, required = false, type = 'year' } = this.props,
            readOnlyText = this.state.value;
        let displayElement = '';
        if (label) {
            displayElement = <><label onClick={() => this.focus()}>{label}{!readOnly && required ? <span style={{ color: 'red' }}> *</span> : ''}</label>{readOnly ? <>: <b>{readOnlyText}</b></> : ''}</>;
        } else {
            displayElement = readOnly ? <b>{readOnlyText}</b> : '';
        }

        return (
            <div className={'form-group ' + (className || '')} style={style}>
                {displayElement}
                <InputMask ref={e => this.input = e} className='form-control' mask={this.mask[type]} onChange={this.handleChange} style={{ display: readOnly ? 'none' : '' }} formatChars={{ '2': '[12]', '0': '[089]', '1': '[01]', '3': '[0-3]', '9': '[0-9]', '5': '[0-5]', 'h': '[0-2]' }} value={this.state.value} readOnly={readOnly} placeholder={placeholder || label} onKeyDown={this.props.onKeyDown} />
                {smallText ? <small>{smallText}</small> : null}
            </div>);
    }
}

export default class FormTextBox extends React.Component {
    static defaultProps = { formType: 'textBox' }
    state = { value: '' };

    value = function (text) {
        if (arguments.length) {
            if (this.props.type == 'number' || this.props.type == 'year' || this.props.type == 'scholastic') {
                this.input.value(text);
            } else {
                this.setState({ value: text });
            }
        } else {
            if (this.props.type == 'number' || this.props.type == 'year' || this.props.type == 'scholastic') {
                return this.input.value();
            }
            return this.state.value;
        }
    }

    focus = () => this.input.focus();
    clear = () => this.input.clear();

    render() {
        let { type = 'text', smallText = '', label = '', placeholder = '', className = '', style = {}, readOnly = false, onChange = null, required = false, readOnlyEmptyText = '', disabled = false } = this.props,
            readOnlyText = this.state.value;
        type = type.toLowerCase(); // type = text | number | email | password | phone | year
        if (type == 'number') {
            return <FormNumberBox ref={e => this.input = e} {...this.props} />;
        } else if (type == 'year' || type == 'scholastic') {
            return <FormYearBox ref={e => this.input = e} {...this.props} />;
        } else {
            const properties = {
                type,
                className: 'form-control',
                placeholder: placeholder || label,
                value: this.state.value,
                onChange: e => this.setState({ value: e.target.value }, () => (onChange && onChange(e)))
            };
            if (type == 'password') properties.autoComplete = 'new-password';
            if (type == 'phone') {
                if (readOnlyText) readOnlyText = T.mobileDisplay(readOnlyText);
                properties.onKeyPress = e => ((!/[0-9]/.test(e.key)) && e.preventDefault());
            }
            let displayElement = '';
            if (label) {
                displayElement = <><label onClick={() => this.input.focus()}>{label}{!readOnly && required ? <span style={{ color: 'red' }}> *</span> : ''}</label>{readOnly ? <>: <b>{readOnlyText || readOnlyEmptyText}</b></> : ''}</>;
            } else {
                displayElement = readOnly ? <b>{readOnlyText || readOnlyEmptyText}</b> : '';
            }

            return (
                <div className={'form-group ' + (className || '')} style={style}>
                    {displayElement}
                    <input disabled={disabled} ref={e => this.input = e} style={{ display: readOnly ? 'none' : 'block' }}{...properties} onKeyDown={this.props.onKeyDown} />
                    {smallText ? <small>{smallText}</small> : null}
                </div>);
        }
    }
}