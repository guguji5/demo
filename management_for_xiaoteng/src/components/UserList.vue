<template>
    <el-container style="height: 100%;">
        <el-header>
            <!-- <img src="../assets/avatar.jpeg"> -->
            <h1>
                用户列表
            </h1>
        </el-header>
        <el-main style="display:flex;flex-direction:column">
            <el-form :inline="true" :model="query" class="demo-form-inline">
                <el-form-item label="用户">
                    <el-input v-model="query.condition" placeholder="用户ID/姓名/电话/身份证"></el-input>
                </el-form-item>
                <el-form-item label="用户状态">
                    <el-select v-model="query.status" placeholder="请选择用户状态">
                        <el-option v-for="(item, index) in status" :label="item" :value="index" :key="index"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="注册时间">
                    <el-date-picker v-model="query.range" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
                    </el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="getList">查询</el-button>
                </el-form-item>
            </el-form>

            <el-table :data="gridData" height="250" border style="width: 100%">
                <el-table-column label="用户ID" width="180">
                    <template slot-scope="scope">
                        {{scope.row.userid | formatUserId}}
                    </template>
                </el-table-column>
                <el-table-column prop="username" label="姓名">
                </el-table-column>
                <el-table-column prop="userphone" label="手机号" width="180">
                </el-table-column>
                <el-table-column label="用户状态">
                    <template slot-scope="scope">
                        {{status[scope.row.userstatus]}}
                    </template>
                </el-table-column>
                <el-table-column prop="registerdate" label="注册时间" width="180">
                </el-table-column>
                <el-table-column prop="loanTime" label="放款时间">
                </el-table-column>
                <el-table-column prop="source" label="渠道" width="180">
                </el-table-column>
                <el-table-column label="操作" width="180">
                    <template slot-scope="scope">
                        <el-button @click="getContacts(scope.row)" type="text" size="small">通讯录</el-button>
                        <el-button type="text" size="small" @click="getCarrierReport(scope.row)">反欺诈</el-button>
                    </template>
                </el-table-column>

            </el-table>

            <el-dialog title="通讯录" :visible.sync="dialogVisible">
                <p>用户姓名:{{dialog.userName}}</p>
                <p>更新时间:{{dialog.updateDate}}</p>
                <p>数量:{{dialog.contactNum}}</p>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="dialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="downloadContacts()">下载</el-button>
                </div>
            </el-dialog>
        </el-main>
        <el-footer>
            <el-pagination @size-change="handleSizeChange" @current-change="handlePagerChange" :current-page.sync="pagination.number" :page-sizes="[5, 10, 20, 50, 100]" :page-size="pagination.pageSize" layout="sizes, prev, pager, next" :total="pagination.total">
            </el-pagination>
        </el-footer>
    </el-container>
</template>

<script>
import { status } from '../utils/config'
import { GetList, GetUserInfo, DownloanContacts } from '../utils/service'

export default {
    name: 'UserList',
    props: {
        msg: String
    },
    data () {
        return {
            query: {
                condition: '',
                status: '0',
                range: ''
            },
            status: status,
            gridData: [],
            pagination: {
                number: 1,
                pageSize: 10,
                total: 10
            },
            dialog: {
                userName: '',
                updateDate: '',
                contactNum: '',
                userId: ''
            },
            dialogVisible: false,
            formLabelWidth: '120px'
        }

    },
    methods: {
        onSubmit () {

        },
        getContacts (row) {
            let userId = row.userid;
            GetUserInfo(userId).then(res => {
                let data = res.data;
                if (data.state.errCode === 10000) {
                    this.dialog.userName = data.body.baseInfo.userName;
                    this.dialog.userId = data.body.baseInfo.id;
                    if (data.body.countContact.length === 0) {
                        this.$message.error('该用户未上传通讯录。');
                    } else {
                        this.dialog.updateDate = data.body.countContact[0] && data.body.countContact[0][1];
                        this.dialog.contactNum = data.body.countContact[0] && data.body.countContact[0][0];
                        this.dialogVisible = true
                    }
                }
            })
        },
        getCarrierReport (row) {
            let userId = row.userid;
            GetUserInfo(userId).then(res => {
                let data = res.data;
                if (data.state.errCode === 10000) {
                    if (data.body.creditInvestigation.message) {
                        window.open('https://tenant.51datakey.com/carrier/report_data?data=' + data.body.creditInvestigation.message)
                    } else {
                        this.$message.error('该用户未完成运营商验证');
                    }
                }
            })
        },
        handleSizeChange (value) {
            this.pagination.pageSize = value;
            this.getList();
        },
        handlePagerChange (value) {
            this.pagination.number = value;
            this.getList();
        },
        getList () {
            let from = this.query.range ? new Date(this.query.range[0]).format("yyyy-MM-dd") : "";
            let to = this.query.range ? new Date(this.query.range[1]).format("yyyy-MM-dd") : "";
            let condition = this.query.condition.trim();
            let status = this.query.status === '0' ? '' : this.query.status;
            GetList(condition, status, this.pagination.number, this.pagination.pageSize, from, to).then(res => {
                let data = res.data;
                if (data.state.errCode === 10000) {
                    this.gridData = data.body.content;
                    this.pagination.total = data.body.total;
                }

            })
        },
        downloadContacts () {
            this.dialogVisible = false
            DownloanContacts(this.dialog.userId)
        }
    },
    filters: {
        formatUserId: function (value) {
            if (!value) return ''
            value = value.toString()
            return value.slice(0, 8)
        }
    },
    created () {
        this.getList();
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
img {
  width: 50px;
  float: right;
  margin-top: 10px;
}
h1 {
  /* float: left; */
  line-height: 50px;
  margin-top: 10px;
  border-bottom: 1px solid #ddd;
}
</style>
