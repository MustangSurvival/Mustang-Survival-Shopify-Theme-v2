import { BaseElementWithoutShadowDOM } from '@/base/BaseElement'
import { customElement, property, queryAsync } from 'lit/decorators.js'

@customElement('inline-media')
export class DeferredMedia extends BaseElementWithoutShadowDOM {
  @property({ reflect: true, attribute: 'playing' })
  playing = false

  @property({ reflect: true, attribute: 'muted' })
  muted = true

  @queryAsync('video') video!: Promise<HTMLVideoElement>
  @queryAsync('[play-toggle]') playToggle!: Promise<HTMLButtonElement>
  @queryAsync('[volume-toggle]') volumeToggle!: Promise<HTMLButtonElement>

  constructor() {
    super()
    this._handlePlayState = this._handlePlayState.bind(this)
    this._handleVolumeToggle = this._handleVolumeToggle.bind(this)
  }

  async connectedCallback() {
    super.connectedCallback()
    const playToggle = await this.playToggle
    playToggle?.addEventListener('click', this._handlePlayState)

    const volumeToggle = await this.volumeToggle
    volumeToggle?.addEventListener('click', this._handleVolumeToggle)

    this._attachHTMLVideoEvents()
  }

  play(): void {
    if (this.playing) return
    this.#play()
  }

  pause(): void {
    if (!this.playing) return
    this.#pause()
  }

  _handlePlayState(): void {
    this.playing ? this.pause() : this.play()
  }

  _handleVolumeToggle(): void {
    this.video.then(($video) => {
      $video.muted = !$video.muted
      this.muted = $video.muted
    })
  }

  #pause(): Promise<void> {
    return this.#togglePlayState(false)
  }

  async #togglePlayState(play = true) {
    const $video = await this.video
    play ? $video?.play() : $video?.pause()
  }

  #play(): Promise<void> {
    return this.#togglePlayState(true)
  }

  getVideoPlayState(video: HTMLVideoElement): boolean {
    return !!(
      video.currentTime > 0 &&
      !video.paused &&
      !video.ended &&
      video.readyState > 2
    )
  }

  async _attachHTMLVideoEvents() {
    const $video = await this.video
    if (!$video) return
    this.playing = this.getVideoPlayState($video)
    this.muted = $video.muted

    $video.addEventListener('pause', () => {
      this.playing = false
    })

    $video.addEventListener('play', () => {
      this.playing = true
    })

    $video.addEventListener('playing', () => {
      this.playing = true
    })
  }
}
