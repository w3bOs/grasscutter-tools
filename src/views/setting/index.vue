<template>
  <div class="px-10 flex-col items-center">
    <my-divider :title="t('server settings')" />
    <n-form ref="serverRef" label-placement="left" inline :model="server" :rules="serverRules" class="flex-center">
      <n-form-item :label="t('server')" path="ip">
        <n-input-group>
          <n-popselect v-model:value="server.protocol" :options="protocolOptions">
            <n-input-group-label>{{ server.protocol }}</n-input-group-label>
          </n-popselect>
          <n-input v-model:value="server.ip">
            <template #suffix>
              <n-dropdown trigger="hover" :options="history" :render-label="renderDropdownLabel">
                <my-button>
                  <icon-material-symbols-history />
                </my-button>
              </n-dropdown>
            </template>
          </n-input>
        </n-input-group>
      </n-form-item>
      <n-form-item :label="t('username')" path="username">
        <n-input v-model:value="server.username" />
      </n-form-item>
      <my-button @click="updateServer">
        <icon-line-md-edit-twotone />
        <template #tooltip>
          <span>{{ t('save settings') }}</span>
        </template>
      </my-button>
    </n-form>

    <my-divider :title="t('player auth')">
      <span>{{ t('send code mail') }}</span
      ><br />
      <span>{{ t('password verify') }}</span>
    </my-divider>
    <n-space>
      <my-button @click="handleChangeAuthWay">
        <icon-line-md-rotate-270 :class="{ 'animate-spin': loadingChange }" />
        <template #tooltip>
          <span>{{ t('change verify') }}</span>
        </template>
      </my-button>
      <my-button v-if="authWay" :text="t('send code')" @click-async="sendVerifyCode">
        <icon-line-md-email />
        <template #popconfirm>
          <span>{{ t('whether send code') }}</span>
        </template>
      </my-button>
      <n-form-item v-if="authWay" ref="verifyCodeRef" :show-label="false" :rule="verifyCodeRule">
        <n-input v-model:value="verifyCode" />
      </n-form-item>
      <n-form-item v-else ref="passwordRef" :show-label="false" :rule="passwordRule">
        <n-input v-model:value="password" type="password" />
      </n-form-item>
      <my-button :text="t('auth')" @click-async="handlePlayerAuth">
        <icon-line-md-confirm />
      </my-button>
    </n-space>

    <my-divider :title="t('admin auth')">
      <span>{{ t('adv find') }}</span>
    </my-divider>
    <n-space>
      <n-form-item ref="adminVoucherRef" :show-label="false" :rule="adminVoucherRule">
        <n-input v-model:value="adminVoucher" type="password" autosize class="w-24rem" />
      </n-form-item>
      <my-button :text="t('auth')" @click-async="handleAdminAuth">
        <icon-line-md-confirm />
      </my-button>
    </n-space>

    <my-divider :title="t('create account')" dashed />
    <n-form ref="accountRef" label-placement="left" inline :model="account" :rules="accountRules" class="flex-center">
      <n-form-item :label="t('username')" path="username">
        <n-input v-model:value="account.username" />
      </n-form-item>
      <n-form-item :label="t('password')" path="password">
        <n-input v-model:value="account.password" />
      </n-form-item>
      <my-button :text="t('create')" @click-async="handleCreateAccount">
        <icon-line-md-account-add />
      </my-button>
    </n-form>

    <my-divider :title="t('admin console')" dashed />
    <div class="flex w-full items-center">
      <n-input v-model:value="command" type="textarea" />
      <my-button type="primary" class="ml-10" :text="t('execute')" @click-async="handleAdminCommand">
        <icon-line-md-chevron-small-triple-left />
      </my-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { FormInst, FormItemInst, FormRules, FormItemRule, DropdownOption } from 'naive-ui'
  import { useI18n } from 'vue-i18n'
  import { useThrottleFn } from '@vueuse/core'
  import IconDelete from '~icons/mdi/delete-forever-outline'
  import { MyButton } from '@/components'
  import { useSettingStore } from '@/stores'
  import {
    mailVerifyCode,
    playerAuthByVerifyCode,
    playerAuthByPassword,
    adminAuth,
    adminCreateAccount,
    adminCommand
  } from '@/http'
  import { testUrlOrIP } from '@/utils'

  const { t } = useI18n()

  const settingStore = useSettingStore()
  const { server, updateServer } = settingStore

  const protocolOptions = [
    { label: 'http', value: 'http' },
    { label: 'https', value: 'https' }
  ]
  const serverRef = ref<FormInst | null>(null)
  const serverRules: FormRules = {
    ip: {
      required: true,
      trigger: ['input', 'blur'],
      validator(_rule, value) {
        if (!value) {
          return new Error(t('input server'))
        } else if (!testUrlOrIP(value)) {
          return new Error(t('server error'))
        }
        return true
      }
    },
    username: {
      required: true,
      message: t('input username'),
      trigger: ['input', 'blur']
    }
  }

  const history = computed(() => server.history.map(item => ({ key: item, label: item })))

  function renderDropdownLabel(option: DropdownOption) {
    return h('div', { class: 'flex-between' }, [
      h('span', { class: 'mr-2', onClick: () => handleSelectHistory(option.key) }, { default: () => option.label }),
      h(MyButton, { onClick: () => deleteHistory(option.key) }, { default: () => h(IconDelete) })
    ])
  }

  function deleteHistory(key?: string | number) {
    if (key) {
      const history = server.history
      history.splice(
        history.findIndex(item => item === key),
        1
      )
    }
  }

  function handleSelectHistory(key?: string | number) {
    if (key && typeof key === 'string') {
      server.ip = key
      updateServer()
    }
  }

  const loadingChange = ref(false)
  const authWay = ref(true)
  const handleChangeAuthWay = useThrottleFn(function () {
    loadingChange.value = true
    authWay.value = !authWay.value
    setTimeout(() => {
      loadingChange.value = false
    }, 1000)
  }, 1000)

  async function checkService() {
    let check = false
    await serverRef.value?.validate(err => {
      if (!err) {
        check = true
      }
    })
    return check
  }

  async function sendVerifyCode() {
    const check = await checkService()
    if (!check) return

    const result = await mailVerifyCode(server.username)
    if (result?.code === 200) {
      window.$message?.success(t('send code success'))
    }
  }

  const verifyCode = ref<string>('')
  const verifyCodeRef = ref<FormItemInst | null>(null)
  const verifyCodeRule: FormItemRule = {
    validator() {
      if (verifyCode.value.length === 0) {
        return new Error(t('input code'))
      }
    },
    trigger: ['input', 'blur']
  }

  const password = ref<string>('')
  const passwordRef = ref<FormItemInst | null>(null)
  const passwordRule: FormItemRule = {
    validator() {
      if (password.value.length === 0) {
        return new Error(t('input password'))
      }
    },
    trigger: ['input', 'blur']
  }

  async function handlePlayerAuth() {
    const check = await checkService()
    if (!check) return

    let result: ApiResult<string> | undefined
    if (authWay.value) {
      await verifyCodeRef.value?.validate().then(async () => {
        result = await playerAuthByVerifyCode(server.username, verifyCode.value)
      })
    } else {
      await passwordRef.value?.validate().then(async () => {
        result = await playerAuthByPassword(server.username, password.value)
      })
    }
    const token = result?.data
    if (token) {
      window.$message?.success(t('auth success'))
      settingStore.updateToken(token)
    }
  }

  const adminVoucher = ref<string>('')
  const adminVoucherRef = ref<FormItemInst | null>(null)
  const adminVoucherRule: FormItemRule = {
    validator() {
      if (adminVoucher.value.length === 0) {
        return new Error(t('input adv'))
      }
    },
    trigger: ['input']
  }

  async function handleAdminAuth() {
    await adminVoucherRef.value?.validate().then(async () => {
      const result = await adminAuth(adminVoucher.value)
      const token = result?.data
      if (token) {
        window.$message?.success(t('verify success'))
        settingStore.updateAdminToken(token)
      }
    })
  }

  interface Account {
    username: string
    password: string
  }

  const accountRef = ref<FormInst | null>(null)
  const account = reactive<Account>({
    username: '',
    password: ''
  })
  const accountRules: FormRules = {
    username: {
      required: true,
      message: t('input username'),
      trigger: ['input', 'blur']
    },
    password: {
      required: true,
      message: t('input password'),
      trigger: ['input', 'blur']
    }
  }

  async function handleCreateAccount() {
    await accountRef.value?.validate().then(async () => {
      const result = await adminCreateAccount(account)
      if (result?.code === 200) {
        window.$message?.success(t('accout create success'))
      }
    })
  }

  const command = ref('')

  async function handleAdminCommand() {
    if (command.value.length > 0) {
      const result = await adminCommand(command.value)
      if (result?.code === 200) {
        window.$message?.success(result.msg)
      }
    }
  }
</script>
