import React, { Component } from 'react';
import { Button, Table, Row, Col, message } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import wanUtil from "wanchain-util";

import './index.less';

import { EditableFormRow, EditableCell } from './Rename';
import SendNormalTrans from 'components/SendNormalTrans';
import CopyAndQrcode from 'components/CopyAndQrcode';
import TransHistory from 'components/TransHistory';

import totalImg from 'static/image/wan.png';

const WAN = "m/44'/5718350'/0'/0/";
const CHAINTYPE = 'WAN';
const SYMBOL = 'WAN';
const WALLETID = 1;
const KEYSTOREID = 5;

@inject(stores => ({
  addrInfo: stores.wanAddress.addrInfo,
  language: stores.languageIntl.language,
  getAddrList: stores.wanAddress.getAddrList,
  getAmount: stores.wanAddress.getNormalAmount,
  transParams: stores.sendTransParams.transParams,
  updateName: arr => stores.wanAddress.updateName(arr),
  addAddress: newAddr => stores.wanAddress.addAddress(newAddr),
  changeTitle: newTitle => stores.session.changeTitle(newTitle),
  updateTransHistory: () => stores.wanAddress.updateTransHistory(),
}))

@observer
class WanAccount extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bool: true,
      isUnlock: false,
    }
    this.props.updateTransHistory();
    this.props.changeTitle(intl.get('WanAccount.wallet'));
  }

  columns = [
    {
      dataIndex: 'name',
      editable: true
    },
    {
      dataIndex: 'address',
      render: text => <div className="addrText"><p className="address">{text}</p><CopyAndQrcode addr={text} /></div>
    },
    {
      dataIndex: 'balance',
      sorter: (a, b) => a.balance - b.balance,
    },
    {
      dataIndex: 'action',
      render: (text, record) => <div><SendNormalTrans from={record.address} path={record.path} handleSend={this.handleSend} chainType={CHAINTYPE}/></div>
    }
  ];

  columnsTree = this.columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: record => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave: this.handleSave,
      }),
    };
  });

  componentDidMount() {
    this.timer = setInterval(() => this.props.updateTransHistory(), 5000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  handleSend = from => {
    let params = this.props.transParams[from];
    let trans = {
      walletID: WALLETID,
      chainType: CHAINTYPE,
      symbol: SYMBOL,
      path: params.path,
      to: params.to,
      amount: params.amount,
      gasLimit: `0x${params.gasLimit.toString(16)}`,
      gasPrice: params.gasPrice,
      nonce: params.nonce
    };
    return new Promise((resolve, reject) => {
      wand.request('transaction_normal', trans, function(err, txHash) {
        if (err) {
          message.warn(intl.get('WanAccount.sendTransactionFailed'));
          console.log(err);
          reject(false)
        } else {
          this.props.updateTransHistory();
          console.log("TxHash:", txHash);
          resolve(txHash)
        }
      }.bind(this));
    })
  }

  creatAccount = () => {
    const { addrInfo, addAddress } = this.props;
    const addrLen = Object.keys(addrInfo['normal']).length;
    this.setState({
      bool: false
    });

    if (this.state.bool) {
      let path = `${WAN}${addrLen}`;
      wand.request('address_getOne', { walletID: WALLETID, chainType: CHAINTYPE, path: path }, (err, val_address_get) => {
        if (!err) {
          wand.request('account_create', { walletID: WALLETID, path: path, meta: { name: `Account${addrLen + 1}`, addr: `0x${val_address_get.address}` } }, (err, val_account_create) => {
            if (!err && val_account_create) {
              let addressInfo = {
                start: addrLen,
                address: wanUtil.toChecksumAddress(`0x${val_address_get.address}`)
              }
              addAddress(addressInfo);
              this.setState({
                bool: true
              });
            }
          });
        }
      });
    }
  }

  handleSave = row => {
    this.props.updateName(row);
  }

  render() {
    const { getAmount, getAddrList } = this.props;
    const components = {
      body: {
        cell: EditableCell,
        row: EditableFormRow,
      },
    };

    this.props.language && this.columnsTree.forEach(col => {
      col.title = intl.get(`WanAccount.${col.dataIndex}`)
    })

    return (
      <div className="account">
        <Row className="title">
          <Col span={12} className="col-left"><img className="totalImg" src={totalImg} alt={intl.get('WanAccount.wanchain')} /> <span className="wanTotal">{getAmount}</span><span className="wanTex">{intl.get('WanAccount.wan')}</span></Col>
          <Col span={12} className="col-right">
          <Button className="creatBtn" type="primary" shape="round" size="large" onClick={this.creatAccount}>{intl.get('WanAccount.create')}</Button>
          </Col>
        </Row>
        <Row className="mainBody">
          <Col>
            <Table components={components} rowClassName={() => 'editable-row'} className="content-wrap" pagination={false} columns={this.columnsTree} dataSource={getAddrList} />
          </Col>
        </Row>
        <Row className="mainBody">
          <Col>
            <TransHistory name="normal" />
          </Col>
        </Row>
      </div>
    );
  }
}

export default WanAccount;