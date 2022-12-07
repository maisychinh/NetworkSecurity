import React from 'react';

export default class FormCheckbox extends React.Component {
    static defaultProps = { formType: 'checkBox' };
    state = { checked: false };

    componentDidMount() {
        $(document).ready(() => {
            if (this.props.isSwitch) {
                this.switch = new Switchery(this.checkbox, { color: '#01a9ac', jackColor: '#fff', size: 'small' });
                this.checkbox.onchange = () => this.onCheck();
            }
        });
    }

    value = (checked) => {
        if (checked != null) {
            if (this.props.isSwitch) {
                if (!this.switch) {
                    setTimeout(() => {
                        this.value(checked);
                    }, 50);
                } else {
                    this.setState({ checked });
                    this.switch.setValue(checked);
                }
            } else {
                this.setState({ checked });
            }
        } else {
            return this.state.checked;
        }
    };

    onCheck = () => {
        if (!this.props.readOnly) {
            this.setState({ checked: !this.state.checked }, () => {
                this.switch.setValue(this.state.checked);
                this.props.onChange && this.props.onChange(this.state.checked);
            });
        }
    }

    render() {
        let { className = '', label, style, isSwitch = false, trueClassName = 'text-primary', falseClassName = 'text-secondary', inline = true } = this.props;
        if (style == null) style = {};
        return isSwitch ? (
            <div className={className} style={{ ...style, display: inline ? 'inline-flex' : '' }}>
                <label style={{ cursor: 'pointer' }} onClick={() => this.onCheck()}>{label}:&nbsp;</label>
                <input type='checkbox' ref={e => this.checkbox = e} disabled={this.props.readOnly} />
            </div>
        ) : (
            <div className={'animated-checkbox ' + className} style={style}>
                <label>
                    <input type='checkbox' disabled={this.props.readOnly} checked={this.state.checked} onChange={this.onCheck} />
                    <span className={'label-text ' + (this.props.readOnly ? 'text-secondary' : this.state.checked ? trueClassName : falseClassName)}>{label}</span>
                </label>
            </div>
        );
    }
}