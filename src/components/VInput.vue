<template>
  <input
    :class="{ input: true, invalid: invalid, disabled: disabled }"
    :placeholder="placeholder"
    :value="value"
    :disabled="disabled"
    :autofocus="autofocus"
    :name="name"
    type="text"
    @keypress="emitKeypress"
    @input="emitInput"
  />
</template>

<script>
export default {
  name: 'VInput',
  props: {
    placeholder: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      default: '',
    },
    value: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    invalid: {
      type: Boolean,
      default: false,
    },
    autofocus: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    emitInput(e) {
      this.$emit('input', e.target.value);
    },
    emitKeypress(e) {
      this.$emit('keypress', e);
    },
  },
};
</script>

<style lang="postcss">
.input {
  width: 100%;
  border: none;
  outline: none;
  border-radius: 0;
  padding: 10px 0;
  border-bottom: 1px solid #4d4d4d;
  border-radius: 0;
  font-size: 16px;
  line-height: 1.5;
  transition: 0.25s;
  background: transparent;

  &.invalid {
    border-bottom: 1px solid #f00;
  }

  &.disabled {
    color: #4d4d4d;
  }
}
</style>
