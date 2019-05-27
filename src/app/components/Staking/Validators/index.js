import React, { Component } from 'react';
import { Row, Col, Button, Table, Form } from 'antd';

import './index.less';
import Cell from './Cell';
import { observer, inject } from 'mobx-react';

import Validator from "./Validator";
import DelegateIn from "./DelegateIn";
import DelegateOut from "./DelegateOut";
@inject(stores => ({
  getAddrList: stores.wanAddress.getAddrList,
  stakingList: stores.staking.stakingList,
}))

@observer
class Validators extends Component {

  constructor(props) {
    super(props)
    this.state = {
      withdrawVisible: false,
      stakeInVisible: false,
    }
  }

  modifyWithdraw = () => {
    this.setState({ withdrawVisible: true });
  }



  handleCancel = () => {
    this.setState({ withdrawVisible: false, stakeInVisible: false });
  }

  handleSend = () => {
    this.setState({ withdrawVisible: false, stakeInVisible: false });
  }

  columns = [
    {
      title: 'MY ACCOUNT',
      dataIndex: 'myAccount',
      key: 'myAccount',
    }, {
      title: 'MY STAKE',
      dataIndex: 'myStake',
      key: 'myStake',
      render: stake => (
        <Cell title={stake.title} bottom={stake.bottom} />
      ),
    }, {
      title: '',
      dataIndex: 'arrow1',
      key: 'arrow1',
      render: img => (
        <img className="table-arrow" src={img} />
      ),
    }, {
      title: 'VALIDATOR',
      dataIndex: 'validator',
      key: 'validator',
      render: validator => (
        <Validator img={validator.img} name={validator.name} />
      ),
    }, {
      title: '',
      dataIndex: 'arrow2',
      key: 'arrow2',
      render: img => (
        <img className="table-arrow" src={img} />
      ),
    }, {
      title: 'DISTRIBUTED REWARDS',
      dataIndex: 'distributeRewards',
      key: 'distributeRewards',
      render: stake => (
        <Cell title={stake.title} bottom={stake.bottom} />
      ),
    }, {
      title: 'MODIFY STAKE',
      dataIndex: 'modifyStake',
      key: 'modifyStake',
      render: (text, record) => {
        return (
          <div>
            <Row>
              <Col span={12} align="center"><DelegateIn record={record} /></Col>
              <Col span={12} align="center"><DelegateOut record={record} /></Col>
            </Row>
            <Row>
              <Col span={12} className="modifyBtnText" align="center">Top-up</Col>
              <Col span={12} className="modifyBtnText" align="center">Exitit</Col>
            </Row>
          </div>
        )
      }
    }
  ]

  render() {
    return (
      <div className="validators">
        <Table columns={this.columns} dataSource={this.props.stakingList} pagination={{ pageSize: 5, hideOnSinglePage: true }} />
      </div>
    );
  }
}

export default Validators