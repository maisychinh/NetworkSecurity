import React from 'react';

export default class FormSelect extends React.Component {
    static defaultProps = { formType: 'selectBox' }
    state = { valueText: '', hasInit: false };
    hasInit = false;

    componentDidMount() {
        const { label, placeholder } = this.props;
        $(this.input).select2({ placeholder: placeholder || label || 'Lựa chọn' });
        $(this.input).on('select2:select', e => this.props.onChange && this.props.onChange(e.params.data));
        $(this.input).on('select2:unselect', e => this.props.onChange && this.props.onChange(this.props.multiple ? e.params.data : null));
        $(this.input).on('select2:open', () => {
            !this.hasInit && setTimeout(() => {
                this.value(null);
                setTimeout(this.focus, 50);
            }, 50);
        });
    }

    componentWillUnmount() {
        $(this.input).off('select2:select');
        $(this.input).off('select2:unselect');
        $(this.input).off('select2:open');
    }

    focus = () => !this.props.readOnly && $(this.input).select2('open');

    clear = () => $(this.input).val('').trigger('change') && $(this.input).html('');

    value = function (value, done = null) {
        const dropdownParent = this.props.dropdownParent || $('.modal-body').has(this.input)[0] || $('.main-body').has(this.input)[0];
        if (arguments.length) {
            this.clear();
            let hasInit = this.hasInit;
            if (!hasInit) this.hasInit = true;

            const { data, label, placeholder, minimumResultsForSearch = 1, allowClear = false } = this.props,
                options = { placeholder: placeholder || label || 'Lựa chọn', dropdownParent: $(dropdownParent), minimumResultsForSearch, allowClear };

            if (Array.isArray(data)) {
                options.data = data;
                $(this.input).select2(options).val(value).trigger('change');
                done && done();
            } else {
                options.ajax = { ...data, delay: 500 };
                $(this.input).select2(options);
                if (value) {
                    if (this.props.multiple) {
                        if (!Array.isArray(value)) {
                            value = [value];
                        }

                        const promiseList = value.map(item => {
                            return new Promise(resolve => {
                                if (item.hasOwnProperty('id') && item.hasOwnProperty('text')) {
                                    const option = new Option(item.text, item.id, true, true);
                                    $(this.input).append(option).trigger('change');
                                    resolve(item.text);
                                } else if ((typeof item == 'string' || typeof item == 'number') && data.fetchOne) {
                                    data.fetchOne(item, _item => {
                                        const option = new Option(_item.text, _item.id, true, true);
                                        $(this.input).append(option).trigger('change');
                                        resolve(_item.text);
                                    });
                                } else {
                                    const option = new Option(item, item, true, true);
                                    $(this.input).append(option).trigger('change');
                                    resolve(item);
                                }
                            });
                        });
                        Promise.all(promiseList).then(valueTexts => {
                            // Async set readOnlyText
                            done && done();
                            this.setState({ valueText: valueTexts.join(', ') });
                        });
                    } else {
                        if ((typeof value == 'string' || typeof value == 'number') && data.fetchOne) {
                            data.fetchOne(value, _item => {
                                const option = new Option(_item.text, _item.id, true, true);
                                $(this.input).append(option).trigger('change');
                                done && done();
                                // Async set readOnlyText
                                this.setState({ valueText: _item.text });
                            });
                        } else if (value.hasOwnProperty('id') && value.hasOwnProperty('text')) {
                            $(this.input).select2('trigger', 'select', { data: value });
                            done && done();
                        } else {
                            $(this.input).select2('trigger', 'select', { data: { id: value, text: value } });
                            done && done();
                        }
                    }
                } else {
                    $(this.input).val(null).trigger('change');
                    done && done();
                }
            }

            // Set readOnly text
            if (!this.props.multiple) {
                if (!data || !data.fetchOne) {
                    this.setState({ valueText: $(this.input).find(':selected').text() || '' });
                }
            }
        } else {
            return $(this.input).val();
        }
    }

    data = () => {
        const inputData = $(this.input).select2('data');
        if (this.props.multiple) {
            return inputData.map(item => ({ id: item.id, text: item.text }));
        } else {
            return inputData[0];
        }
    };

    render = () => {
        const { className = '', style = {}, labelStyle = {}, label = '', multiple = false, readOnly = false, required = false, readOnlyEmptyText = '', readOnlyNormal = false, disabled = false } = this.props;
        return (
            <div className={'form-group ' + className} style={style}>
                {label ? <label style={labelStyle} onClick={this.focus}>{label}{!readOnly && required ? <span style={{ color: 'red' }}> *</span> : ''}{readOnly ? ':' : ''}</label> : null} {readOnly ? (readOnlyNormal ? (this.state.valueText || readOnlyEmptyText) : <b>{this.state.valueText || readOnlyEmptyText}</b>) : ''}
                <div style={{ width: '100%', display: readOnly ? 'none' : 'inline-flex' }}>
                    <select ref={e => this.input = e} multiple={multiple} disabled={readOnly || disabled} />
                </div>
            </div>
        );
    }
}