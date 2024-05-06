<template>
	<view class="content">
		<!-- 游戏开始倒计时 -->
		<u-overlay :show="showOverlay">
			<view class="warp">
				<view class="startText">游戏即将开始</view>
				<view v-if="stopText !== -1" class="startNum">{{stopText}}</view>
			</view>
		</u-overlay>
		<!-- 游戏结束 -->
		<u-overlay :show="gameOverOverlay">
			<view class="warp">
				<view class="startText">游戏结束</view>
				<view class="startNum">得分：{{totalCount}}</view>
				<view class="toGameHome">
					<u-button @click="toGameHome" type="primary">返回首页</u-button>
				</view>
			</view>
		</u-overlay>
		<view class="topContent">
			<view class="totalCount">得分：{{totalCount}}</view>
			<view class="timeClock">倒计时：{{stopClockText}}</view>
		</view>
		<view class="cBg">
			<view
				v-for="(cloitem,colindex) in animals"
			    :key="colindex"
				class="acol"
			>
				<view
					v-for="(item,index) in cloitem"
					:key="index"
					class="aItem"
					:class="{'aItemSelect': selectA.i === item.i && selectA.j === item.j, 'aItemB1': item.style !== undefined && item.style !== 0}"
					@click="animalClick(item)"
				>
					<image
						v-if="item.url !== -1"
						class="pimg" 
						:src="item.url"
					></image>
					<view v-else class="pimg"></view>
					<!-- 消除球类型标记 -->
					<image
						v-if="item.style !== undefined && item.style === 1"
						class="miniPimg" 
						src="/static/s1.png"
					></image>
					<image
						v-if="item.style !== undefined && item.style === 2"
						class="miniPimg" 
						src="/static/s2.png"
					></image>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { selectFrom } from '@/utils/methods.js';
	export default {
		data() {
			return {
				gameOverOverlay: false, // 游戏结束遮罩
				showOverlay: true, // 游戏开始遮罩
				stopText: -1, //开始倒计时文案
				timer: 0, // 3秒倒计时
				stopClockText: 60, //倒计时文案
				timeClock: 0, // 60秒倒计时
				
				// 动物列表
				animals: [],
				// 当前选中的动物
			    selectA: {
					i: -1,
					j: -1
				},
				// 开始消除和移动动物
				startMove: false,
				// 分数
				totalCount: 0,
				
				innerAudioContextHeart: 0, // 背景音
			};
		},
		onLoad() {
			// 创建背景音内部音频上下文
			this.innerAudioContextHeart = uni.createInnerAudioContext();
			this.innerAudioContextHeart.src = '/static/sound/bg.mp3';
			this.innerAudioContextHeart.loop = true // 循环

			// 3秒倒计时
			let t = 3;
			let that = this;
			this.timer = setInterval(function(){
					if (t !== 0) {
						that.stopText = t;
						that.playAudio('/static/sound/time.mp3');
					} else {
						that.stopText = '开始！'
						that.playAudio('/static/sound/start.mp3');
					}
					t--;
					if(t<0){
						if (that.timer) {
							clearInterval(that.timer);
							that.timer = null;
						}
						that.gameTime();
						that.showOverlay = false;
						// 播放音频
						that.innerAudioContextHeart.play();
					}
				}, 1000)

			// 生成动物，第几列第几行
			for (let i = 0; i < 9; i++) {
				let col = [];
				for (let j = 0; j < 9; j++) {
					const type =  selectFrom(1,5);
					col.push({
						url: `/static/animal/a${type}.png`,
						type: type,
						i: i,
						j: j,
					})
				}
				this.animals.push(col)
			}
			this.judgeAllIsThree();
		},
		
		onUnload() {
			this.innerAudioContextHeart.pause(); // 关闭背景音
		},
		
		methods: {
			// 游戏倒计时
			gameTime() {
				let t = 600;
				let that = this;
				this.timeClock = setInterval(function(){
						that.stopClockText = t;
						if (t===1 || t===2 || t===3) {
							that.playAudio('/static/sound/time.mp3');
						};
						t--;
						if(t<0){
							if (that.timeClock) {
								clearInterval(that.timeClock);
								that.timeClock = null;
							}
							that.gameOverOverlay = true;
							that.innerAudioContextHeart.pause(); // 关闭背景音
						}
					}, 1000)
			},
			
			// 将生成的动物列表判断上下左右是否是三个
			judgeAllIsThree() {
				for (let i = 0; i < 9; i++) {
					for (let j = 0; j < 9; j++) {
						this.judgeNowIsThree(i,j);
					}
				}
			},
			
			// 判断当前动物上下左右是否是三个一样的，一样就重新生成动物
			judgeNowIsThree(i,j) {
				let nowType = this.animals[i][j].type;
				if (j!==0 && j!==8 && nowType === this.animals[i][j-1].type && nowType === this.animals[i][j+1].type) {
					this.animals[i][j] = this.createAnimal(i,j);
					this.judgeNowIsThree(i,j);
				} else if (i!==0 && i!==8 && nowType === this.animals[i-1][j].type && nowType === this.animals[i+1][j].type) {
					this.animals[i][j] = this.createAnimal(i,j);
					this.judgeNowIsThree(i,j);
				}
			},
			
			// 判断当前动物上下左右，上上，下下，左左，右右是否是三个一样的，一样就删除
			judgeNowBigIsThree(i,j) {
				let returnType = true; // 默认有一样的
				let nowType = this.animals[i][j].type;
				if (j!==0 && j!==8 && nowType === this.animals[i][j-1].type && nowType === this.animals[i][j+1].type) {
					let bowNum = 3;
					// 上下
					this.$set(this.animals[i], j, {
						url: -1,
						type: -1,
						i: i,
						j: j,
					})
					this.$set(this.animals[i], j-1, {
						url: -1,
						type: -1,
						i: i,
						j: j-1,
					})
					this.$set(this.animals[i], j+1, {
						url: -1,
						type: -1,
						i: i,
						j: j+1,
					})
					this.totalCount+=3;
					// 继续判断延伸的方向动物是否一样
					for(let jj=j+2; jj<9; jj++) {
						if (nowType === this.animals[i][jj].type) {
							bowNum ++;
							this.$set(this.animals[i], jj, {
								url: -1,
								type: -1,
								i: i,
								j: jj,
							})
							this.totalCount++;
						} else {
							break;
						}
					}
					for(let jj=j-2; jj>-1; jj--) {
						if (nowType === this.animals[i][jj].type) {
							bowNum ++;
							this.$set(this.animals[i], jj, {
								url: -1,
								type: -1,
								i: i,
								j: jj,
							})
							this.totalCount++;
						} else {
							break;
						}
					}
					if (bowNum === 4) {
						this.$set(this.animals[i], j, this.createAnimal(i,j,1))
					} else if (bowNum > 4) {
						this.$set(this.animals[i], j, {
							url: `/static/animal/b${2}.png`,
							type: 'b2',
							i: i,
							j: j,
						})
					}
				} else if (i!==0 && i!==8 && nowType === this.animals[i-1][j].type && nowType === this.animals[i+1][j].type) {
					let bowNum = 3;
					// 左右
					this.$set(this.animals[i], j, {
						url: -1,
						type: -1,
						i: i,
						j: j,
					})
					this.$set(this.animals[i-1], j, {
						url: -1,
						type: -1,
						i: i-1,
						j: j,
					})
					this.$set(this.animals[i+1], j, {
						url: -1,
						type: -1,
						i: i+1,
						j: j,
					})
					this.totalCount+=3;
					// 继续判断延伸的方向动物是否一样
					for(let ii=i+2; ii<9; ii++) {
						if (nowType === this.animals[ii][j].type) {
							bowNum++;
							this.$set(this.animals[ii], j, {
								url: -1,
								type: -1,
								i: ii,
								j: j,
							})
							this.totalCount++;
						} else {
							break;
						}
					}
					for(let ii=i-2; ii>-1; ii--) {
						if (nowType === this.animals[ii][j].type) {
							bowNum++;
							this.$set(this.animals[ii], j, {
								url: -1,
								type: -1,
								i: ii,
								j: j,
							})
							this.totalCount++;
						} else {
							break;
						}
					}
					if (bowNum === 4) {
						this.$set(this.animals[i], j, this.createAnimal(i,j,1))
					} else if (bowNum > 4) {
						this.$set(this.animals[i], j, {
							url: `/static/animal/b${2}.png`,
							type: 'b2',
							i: i,
							j: j,
						})
					}
				} else if (j!==0 && j!==1 && nowType === this.animals[i][j-1].type && nowType === this.animals[i][j-2].type) {
					let bowNum = 3;
					// 上上
					this.$set(this.animals[i], j, {
						url: -1,
						type: -1,
						i: i,
						j: j,
					})
					this.$set(this.animals[i], j-1, {
						url: -1,
						type: -1,
						i: i,
						j: j-1,
					})
					this.$set(this.animals[i], j-2, {
						url: -1,
						type: -1,
						i: i,
						j: j-2,
					})
					this.totalCount+=3;
					// 继续判断延伸的方向动物是否一样
					for(let jj=j-3; jj>-1; jj--) {
						if (nowType === this.animals[i][jj].type) {
							bowNum++;
							this.$set(this.animals[i], jj, {
								url: -1,
								type: -1,
								i: i,
								j: jj,
							})
							this.totalCount++;
						} else {
							break;
						}
					}
					if (bowNum === 4) {
						this.$set(this.animals[i], j, this.createAnimal(i,j,1))
					} else if (bowNum > 4) {
						this.$set(this.animals[i], j, {
							url: `/static/animal/b${2}.png`,
							type: 'b2',
							i: i,
							j: j,
						})
					}
				} else if (j!==7 && j!==8 && nowType === this.animals[i][j+1].type && nowType === this.animals[i][j+2].type) {
					let bowNum = 3;
					// 下下
					this.$set(this.animals[i], j, {
						url: -1,
						type: -1,
						i: i,
						j: j,
					})
					this.$set(this.animals[i], j+1, {
						url: -1,
						type: -1,
						i: i,
						j: j+1,
					})
					this.$set(this.animals[i], j+2, {
						url: -1,
						type: -1,
						i: i,
						j: j+2,
					})
					this.totalCount+=3;
					// 继续判断延伸的方向动物是否一样
					for(let jj=j+3; jj<9; jj++) {
						if (nowType === this.animals[i][jj].type) {
							bowNum++;
							this.$set(this.animals[i], jj, {
								url: -1,
								type: -1,
								i: i,
								j: jj,
							})
							this.totalCount++;
						} else {
							break;
						}
					}
					if (bowNum === 4) {
						this.$set(this.animals[i], j, this.createAnimal(i,j,1))
					} else if (bowNum > 4) {
						this.$set(this.animals[i], j, {
							url: `/static/animal/b${2}.png`,
							type: 'b2',
							i: i,
							j: j,
						})
					}
				} else if (i!==0 && i!==1 && nowType === this.animals[i-1][j].type && nowType === this.animals[i-2][j].type) {
					let bowNum = 3;
					// 左左
					this.$set(this.animals[i], j, {
						url: -1,
						type: -1,
						i: i,
						j: j,
					})
					this.$set(this.animals[i-1], j, {
						url: -1,
						type: -1,
						i: i-1,
						j: j,
					})
					this.$set(this.animals[i-2], j, {
						url: -1,
						type: -1,
						i: i-2,
						j: j,
					})
					this.totalCount+=3;
					// 继续判断延伸的方向动物是否一样
					for(let ii=i-3; ii>-1; ii--) {
						if (nowType === this.animals[ii][j].type) {
							bowNum++;
							this.$set(this.animals[ii], j, {
								url: -1,
								type: -1,
								i: ii,
								j: j,
							})
							this.totalCount++;
						} else {
							break;
						}
					}
					if (bowNum === 4) {
						this.$set(this.animals[i], j, this.createAnimal(i,j,1))
					} else if (bowNum > 4) {
						this.$set(this.animals[i], j, {
							url: `/static/animal/b${2}.png`,
							type: 'b2',
							i: i,
							j: j,
						})
					}
				} else if (i!==7 && i!==8 && nowType === this.animals[i+1][j].type && nowType === this.animals[i+2][j].type) {
					let bowNum = 3;
					// 右右
					this.$set(this.animals[i], j, {
						url: -1,
						type: -1,
						i: i,
						j: j,
					})
					this.$set(this.animals[i+1], j, {
						url: -1,
						type: -1,
						i: i+1,
						j: j,
					})
					this.$set(this.animals[i+2], j, {
						url: -1,
						type: -1,
						i: i+2,
						j: j,
					})
					this.totalCount+=3;
					// 继续判断延伸的方向动物是否一样
					for(let ii=i+3; ii<9; ii++) {
						if (nowType === this.animals[ii][j].type) {
							bowNum++;
							this.$set(this.animals[ii], j, {
								url: -1,
								type: -1,
								i: ii,
								j: j,
							})
							this.totalCount++;
						} else {
							break;
						}
					}
					if (bowNum === 4) {
						this.$set(this.animals[i], j, this.createAnimal(i,j,1))
					} else if (bowNum > 4) {
						this.$set(this.animals[i], j, {
							url: `/static/animal/b${2}.png`,
							type: 'b2',
							i: i,
							j: j,
						})
					}
				} else {
					returnType = false;
				}
				return returnType;
			},
			
			// 移动动物，从上往下移动一格
			moveAnimal() {
				let hasEmpty = false;
				for (let i = 0; i < 9; i++) {
					for (let j = 8; j > -1; j--) {
						if (this.animals[i][j].type === -1) {
							if (j === 0) {
								this.$set(this.animals[i], j, this.createAnimal(i,j))
							} else {
								this.$set(this.animals[i], j, {
									url: this.animals[i][j-1].url,
									type: this.animals[i][j-1].type,
									i: i,
									j: j,
									style: this.animals[i][j-1].style || 0 // 是否是消除球
								})
								this.$set(this.animals[i], j-1, {
									url: -1,
									type: -1,
									i: i,
									j: j-1,
								})
								hasEmpty = true;
							}
						}
					}
				}
				// 是否还有空的动物格子，有就继续向下移动动物
				if (hasEmpty) {
					setTimeout(()=> {
						this.moveAnimal();
					}, 200)
				} else {
					// 移动好动物以后再遍历一遍删除所有三个一样的动物
					let isDelete = false;
					for (let i = 0; i < 9; i++) {
						for (let j = 0; j < 9; j++) {
							let nowType = this.animals[i][j].type;
							if (j!==0 && j!==8 && nowType === this.animals[i][j-1].type && nowType === this.animals[i][j+1].type &&
								(this.animals[i][j].style === undefined || this.animals[i][j].style === 0) &&
								(this.animals[i][j-1].style === undefined || this.animals[i][j-1].style === 0) &&
								(this.animals[i][j+1].style === undefined || this.animals[i][j+1].style === 0)
							) {
								// 上下
								this.$set(this.animals[i], j, {
									url: -1,
									type: -1,
									i: i,
									j: j,
								})
								this.$set(this.animals[i], j-1, {
									url: -1,
									type: -1,
									i: i,
									j: j-1,
								})
								this.$set(this.animals[i], j+1, {
									url: -1,
									type: -1,
									i: i,
									j: j+1,
								})
								this.totalCount+=3;
								isDelete = true;
								// 继续判断延伸的方向动物是否一样
								for(let jj=j+2; jj<9; jj++) {
									if (nowType === this.animals[i][jj].type) {
										// 碰到消除球就停止
										if (this.animals[i][jj].style === undefined || this.animals[i][jj].style === 0) {
											break;
										}
										this.$set(this.animals[i], jj, {
											url: -1,
											type: -1,
											i: i,
											j: jj,
										})
										this.totalCount++;
									} else {
										break;
									}
								}
								for(let jj=j-2; jj>-1; jj--) {
									if (nowType === this.animals[i][jj].type) {
										// 碰到消除球就停止
										if (this.animals[i][jj].style === undefined || this.animals[i][jj].style === 0) {
											break;
										}
										this.$set(this.animals[i], jj, {
											url: -1,
											type: -1,
											i: i,
											j: jj,
										})
										this.totalCount++;
									} else {
										break;
									}
								}
							} else if (i!==0 && i!==8 && nowType === this.animals[i-1][j].type && nowType === this.animals[i+1][j].type &&
								(this.animals[i][j].style === undefined || this.animals[i][j].style === 0) &&
								(this.animals[i-1][j].style === undefined || this.animals[i-1][j].style === 0) &&
								(this.animals[i+1][j].style === undefined || this.animals[i+1][j].style === 0)
							) {
								// 左右
								this.$set(this.animals[i], j, {
									url: -1,
									type: -1,
									i: i,
									j: j,
								})
								this.$set(this.animals[i-1], j, {
									url: -1,
									type: -1,
									i: i-1,
									j: j,
								})
								this.$set(this.animals[i+1], j, {
									url: -1,
									type: -1,
									i: i+1,
									j: j,
								})
								this.totalCount+=3;
								isDelete = true;
								// 继续判断延伸的方向动物是否一样
								for(let ii=i+2; ii<9; ii++) {
									if (nowType === this.animals[ii][j].type) {
										// 碰到消除球就停止
										if (this.animals[ii][j].style === undefined || this.animals[ii][j].style === 0) {
											break;
										}
										this.$set(this.animals[ii], j, {
											url: -1,
											type: -1,
											i: ii,
											j: j,
										})
										this.totalCount++;
									} else {
										break;
									}
								}
								for(let ii=i-2; ii>-1; ii--) {
									if (nowType === this.animals[ii][j].type) {
										// 碰到消除球就停止
										if (this.animals[ii][j].style === undefined || this.animals[ii][j].style === 0) {
											break;
										}
										this.$set(this.animals[ii], j, {
											url: -1,
											type: -1,
											i: ii,
											j: j,
										})
										this.totalCount++;
									} else {
										break;
									}
								}
							}
						}
					}
					// 如果有删除动物的再重新遍历移动动物（不断循环)
					if (isDelete === true) {
						setTimeout(()=> {
							this.moveAnimal();
						}, 200)
					} else {
						// 方法出口，全部移动完成且没有三个一起的动物
						this.startMove = false;
					}
				}
			},
			
			// 生成动物
			createAnimal(i, j, style = 0) {
				// 是否是消除球
				let styletype = 0;
				if (style !== 0) styletype = selectFrom(1,2);

				const type =  selectFrom(1,5);
				const animal = {
					url: `/static/animal/a${type}.png`,
					type: type,
					i: i,
					j: j,
					style: styletype // 是否是消除球
				};
				return animal;
			},
			
			// 动物点击判断
			animalClick(item) {
				// 如果正在移动，点击就应该没反应
				if (this.startMove) return;
				let si = this.selectA.i;
				let sj = this.selectA.j;
				console.log('22222', si, sj)
				// 单独点击了消除球
				if (si === -1 && sj === -1 && item.style !== undefined && item.style !== 0) {
					this.playAudio('/static/sound/amaz.mp3');
					// 删除一列后移动动物
					if (item.style === 1) {
						for(let jj=0; jj<9; jj++) {
							this.$set(this.animals[item.i], jj, {
								url: -1,
								type: -1,
								i: item.i,
								j: jj,
							})
							this.totalCount+=1;
						}
						setTimeout(()=> {
							this.moveAnimal();
						}, 200)
					} else {
						let minI = item.i - 1;
						let maxI = item.i + 1;
						let minJ = item.j - 1;
						let maxJ = item.j + 1;
						if (minI < 0) minI = 0;
						if (maxI > 8) maxI = 8;
						if (minJ < 0) minJ = 0;
						if (maxJ > 8) maxJ = 8;
						for(let ii=minI; ii<maxI+1; ii++) {
							for(let jj=minJ; jj<maxJ+1; jj++) {
								this.$set(this.animals[ii], jj, {
									url: -1,
									type: -1,
									i: ii,
									j: jj,
								})
								this.totalCount+=1;
							}
						}
						setTimeout(()=> {
							this.moveAnimal();
						}, 200)
					}
					this.selectA = {i: -1, j: -1};
					return;
				}
				// 点了两下的
				if(
					((si + 1 === item.i || si - 1 === item.i ) && sj === item.j)
					||
					((sj + 1 === item.j || sj - 1 === item.j ) && si === item.i)
				) {
					console.log('111111', si, sj, item)
					// 爆炸球碰到普通球
					if ((this.animals[si][sj].type === 'b2' && (item.type !== 'b2' && (item.style === undefined || item.style === 0))) ||
						(item.type === 'b2' && (this.animals[si][sj].type !== 'b2' && (this.animals[si][sj].style === undefined || this.animals[si][sj].style === 0)))
					) {
						this.playAudio('/static/sound/unbi.mp3');
						let nowType = -1;
						if (this.animals[si][sj].type !== 'b2') {
							nowType = this.animals[si][sj].type;
							this.$set(this.animals[item.i], item.j, {
								url: -1,
								type: -1,
								i: item.i,
								j: item.j,
							})
							this.totalCount+=1;
						}
						if (item.type !== 'b2') {
							nowType = item.type;
							this.$set(this.animals[si], sj, {
								url: -1,
								type: -1,
								i: si,
								j: sj,
							})
							this.totalCount+=1;
						}
						for(let ii=0; ii<9; ii++) {
							for(let jj=0; jj<9; jj++) {
								if (this.animals[ii][jj].type === nowType) {
									this.$set(this.animals[ii], jj, {
										url: -1,
										type: -1,
										i: ii,
										j: jj,
									})
									this.totalCount+=1;
								}
							}
						}
						this.selectA = {i: -1, j: -1};
						setTimeout(()=> {
							this.moveAnimal();
						}, 200)
						return;
					}
					// 爆炸球碰到消除球
					if ((this.animals[si][sj].type === 'b2' && (item.type !== 'b2' && (item.style !== undefined && item.style !== 0))) ||
						(item.type === 'b2' && (this.animals[si][sj].type !== 'b2' && (this.animals[si][sj].style !== undefined || this.animals[si][sj].style !== 0)))
					) {
						this.playAudio('/static/sound/wao.mp3');
						let nowType = -1;
						let nowStyle = 0;
						if (this.animals[si][sj].type !== 'b2') {
							nowType = this.animals[si][sj].type;
							nowStyle = this.animals[si][sj].style;
							this.$set(this.animals[item.i], item.j, {
								url: -1,
								type: -1,
								i: item.i,
								j: item.j,
							})
							this.totalCount+=1;
						}
						if (item.type !== 'b2') {
							nowType = item.type;
							nowStyle = item.style;
							this.$set(this.animals[si], sj, {
								url: -1,
								type: -1,
								i: si,
								j: sj,
							})
							this.totalCount+=1;
						}
						for(let ii=0; ii<9; ii++) {
							for(let jj=0; jj<9; jj++) {
								if (this.animals[ii][jj].type === nowType) {
									// 删除一列后移动动物
									if (nowStyle === 1) {
										for(let jjj=0; jjj<9; jjj++) {
											this.$set(this.animals[ii], jjj, {
												url: -1,
												type: -1,
												i: ii,
												j: jjj,
											})
											this.totalCount+=1;
										}
									} else {
										let minI = ii - 1;
										let maxI = ii + 1;
										let minJ = jj - 1;
										let maxJ = jj + 1;
										if (minI < 0) minI = 0;
										if (maxI > 8) maxI = 8;
										if (minJ < 0) minJ = 0;
										if (maxJ > 8) maxJ = 8;
										for(let iii=minI; iii<maxI+1; iii++) {
											for(let jjj=minJ; jjj<maxJ+1; jjj++) {
												this.$set(this.animals[iii], jjj, {
													url: -1,
													type: -1,
													i: iii,
													j: jjj,
												})
												this.totalCount+=1;
											}
										}
									}
								}
							}
						}
						this.selectA = {i: -1, j: -1};
						setTimeout(()=> {
							this.moveAnimal();
						}, 200)
						return;
					}
					
					// 如果是上下左右的，就交换
					this.changeAnimal(this.animals[si][sj], item);
					this.selectA = {i: -1, j: -1};
					// 如果没有删除的就交换回来
					let flag1 = this.judgeNowBigIsThree(si,sj);
					let flag2 = this.judgeNowBigIsThree(item.i,item.j);
					if (!flag1 && !flag2) {
						this.playAudio('/static/sound/change.mp3');
						setTimeout(() => {
							this.changeAnimal(this.animals[si][sj], this.animals[item.i][item.j]);
						}, 200)
					} else {
						this.playAudio('/static/sound/clear.mp3');
						this.startMove = true;
						// 如果删除了，就所有上面的动物向下移动一格
						setTimeout(()=> {
							this.moveAnimal();
						}, 200)
					}
				} else {
					this.selectA = {i: item.i, j: item.j};
					this.playAudio('/static/sound/click.mp3');
				}
				
			},
			
			// 交换动物
			changeAnimal(itemA, itemB) {
				const centerAnimal = this.animals[itemA.i][itemA.j];
				this.$set(this.animals[itemA.i], itemA.j, {
					url: itemB.url,
					type: itemB.type,
					i: itemA.i,
					j: itemA.j,
					style: itemB.style || 0 // 是否是消除球
				})
				this.$set(this.animals[itemB.i], itemB.j, {
					url: centerAnimal.url,
					type: centerAnimal.type,
					i: itemB.i,
					j: itemB.j,
					style: centerAnimal.style || 0 // 是否是消除球
				})
			},
			
			// 播放声音
			playAudio(url) {
			  // // 播放音频(h5端)
			  // let audio = new Audio(url);
			  // audio.play();
			  
				// 创建内部音频上下文
				const innerAudioContext = uni.createInnerAudioContext();
				innerAudioContext.src = url;
				// 播放音频
				innerAudioContext.play();
				setTimeout(() => {
					innerAudioContext.destroy();
				}, 5000)
			},
			
			// 返回首页
			toGameHome() {
				uni.navigateBack({
				    delta: 1
				});
			},
		}
	}
</script>

<style lang="scss">
	.content {
		width: 100%;
		height: 100%;
		overflow: hidden;
		position: relative;
		.warp {
			display: flex;
			align-items: center;
			flex-direction: column;
			justify-content: center;
			height: 100%;
			width: 100%;
			.startText {
				font-family: "Arial", sans-serif;
				font-size: 36px;
				background-image: linear-gradient(120deg, #f6d365 0%, #fda085 100%);
				-webkit-background-clip: text;
				color: transparent;
				font-weight: bold;
			}
			.startNum {
				margin-top: 20px;
				font-family: "Arial", sans-serif;
				font-size: 50px;
				background-image: linear-gradient(to right, #ff8177 0%, #ff867a 0%, #ff8c7f 21%, #f99185 52%, #cf556c 78%, #b12a5b 100%);
				-webkit-background-clip: text;
				color: transparent;
				font-weight: bold;
			}
			.endNum {
				margin-top: 20px;
				font-family: "Arial", sans-serif;
				font-size: 50px;
				background-image: linear-gradient(to right, #ff8177 0%, #ff867a 0%, #ff8c7f 21%, #f99185 52%, #cf556c 78%, #b12a5b 100%);
				-webkit-background-clip: text;
				color: transparent;
				font-weight: bold;
			}
			.toGameHome {
				width: 50vw;
				height: 10vw;
			}
		}
	}
	.topContent {
		display: flex;
		align-items: center;
		justify-content: space-around;
		.totalCount {
			font-family: "Arial", sans-serif;
			font-size: 40rpx;
			background-image: linear-gradient(to right, #6a11cb 0%, #2575fc 100%);
			-webkit-background-clip: text;
			color: transparent;
			font-weight: bold;
		}
		.timeClock {
			font-family: "Arial", sans-serif;
			font-size: 40rpx;
			background-image: linear-gradient(to right, #6a11cb 0%, #2575fc 100%);
			-webkit-background-clip: text;
			color: transparent;
			font-weight: bold;
		}
	}
	.cBg {
		box-sizing: border-box;
		width: 750rpx;
		padding: 2rpx;
		// background-color: rgba(227, 227, 227, 0.3);
		display: flex;
		align-items: center;
		justify-content: space-around;
		flex-direction: row;
	}
	.acol {
		height: 750rpx;
		display: flex;
		align-items: center;
		justify-content: space-around;
		flex-direction: column;
		.aItem {
			border-radius: 10rpx;
			width: 76rpx;
			height: 76rpx;
			background-color: rgba(0, 0, 0, 0.1);
			display: flex;
			align-items: center;
			justify-content: center;
			position: relative;
			border: 4rpx solid #fff;
			.pimg {
				border-radius: 6rpx;
				width: 76rpx;
				height: 76rpx;
			}
			.miniPimg {
				position: absolute;
				bottom: 0;
				right: 0;
				z-index: 1;
				width: 30rpx;
				height: 30rpx;
			}
		}
			
		.aItemSelect {
			// background-color: rgba(255, 255, 255, 1);
			border: 4rpx solid red;
		}
		.aItemB1 {
			border: 4rpx solid #6a11cb;
		}
	}
</style>
