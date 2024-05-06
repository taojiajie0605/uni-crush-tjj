<template>
	<view class="content">
		<view class="btn-area">
			<u-button @click="toGamePage" type="primary">进入游戏</u-button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				title: 'Hello'
			}
		},
		onLoad() {

		},
		methods: {
			toGamePage() {
				// 跳转新页面
				uni.navigateTo({
					url: '/pages/crush/crush?id=1&name=uniapp'
				});
			}
		}
	}
</script>

<style lang="scss">
	uni-page-body {
		height: 100%;
		overflow-y: scroll;
	}
	page {
		height: 100%;
		overflow-y: scroll;
	}
	.btn-area {
		width: 375rpx;
		margin-top: 20rpx;
	}
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
</style>
