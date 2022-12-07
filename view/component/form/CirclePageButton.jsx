import React from 'react';
import { Link } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';

export default class CirclePageButton extends React.Component {
    render() {
        const { type = 'back', style = {}, to = '', tooltip = '', customIcon = '', customClassName = 'btn-warning', onClick = () => { } } = this.props; // type = back | save | create | delete | export | import | custom
        const properties = {
            type: 'button',
            style: {
                position: 'fixed', right: '10px', bottom: '10px', zIndex: 500, ...style
            },
            onClick
        };
        let result = null;
        if (type == 'save') {
            result = (
                <button {...properties} className='btn btn-primary btn-circle'>
                    <i className='icofont icofont-save' />
                </button>
            );
        } else if (type == 'search') {
            result = (
                <button {...properties} className='btn btn-primary btn-circle'>
                    <i className='icofont icofont-ui-search' />
                </button>
            );
        } else if (type == 'create') {
            result = (
                <button {...properties} className='btn btn-info btn-circle'>
                    <i className='icofont icofont-plus' />
                </button>
            );
        } else if (type == 'export') {
            result = (
                <button {...properties} className='btn btn-success btn-circle'>
                    <i className='icofont icofont-file-excel' />
                </button>
            );
        } else if (type == 'import') {
            result = (
                <button {...properties} className='btn btn-success btn-circle'>
                    <i className='icofont icofont-cloud-upload' />
                </button>
            );
        } else if (type == 'refresh') {
            result = (
                <button {...properties} className='btn btn-warning btn-circle'>
                    <i className='icofont icofont-refresh' />
                </button>
            );
        } else if (type == 'delete') {
            result = (
                <button {...properties} className='btn btn-danger btn-circle'>
                    <i className='fa fa-trash' />
                </button>
            );
        } else if (type == 'custom') {
            result = (
                <button {...properties} className={'btn btn-circle ' + customClassName}>
                    <i className={'fa ' + customIcon} />
                </button>
            );
        } else {
            if (typeof to == 'string') {
                result = (
                    <Link to={to} className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px', zIndex: 500, ...style }}>
                        <i className='fa fa-reply' />
                    </Link>
                );
            } else {
                result = (
                    <button style={{ position: 'fixed', bottom: '10px', zIndex: 500, ...style }} onClick={to} className='btn btn-circle btn-secondary'>
                        <i className='fa fa-reply' />
                    </button>
                );
            }
        }
        return tooltip ? (
            <Tooltip title={tooltip} arrow placement='top'>
                {result}
            </Tooltip>
        ) : (
            result
        );
    }
}