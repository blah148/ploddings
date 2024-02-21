import React, { Component } from 'react';
import {PitchShifter} from 'soundtouchjs';
import messages from './language.json';
import styles from './SlowDowner.module.css';
import PlayIcon from './PlayIcon';
import PauseIcon from './PauseIcon';
import RewindIcon from './RewindIcon';
import LoopIcon from './LoopIcon';
// ATTENTION: CRASHES IF MP3 ISN'T FETCHED YET... NEED TO WAIT FOR DB QUERY of MP3

var m = messages.us;
var audioCtx;
var gainNode;
// =  audioCtx.createGain()
var shifter = null // null

class SlowDowner extends Component {

  constructor (props){
    super(props)

    this.params = {
      filename: null,
      audioBuffer: null,
      isPlaying: false,
      loop: false,
      loopInterval: 0.0,
      exportDataL: null,
      exportDataR: null,
      exportBuffer: null,
      save: false
    }

    this.state = {
      playingAt: 0,
      playingAtSlider: 0,
      timeA: 0,
      timeB: 0,
      playSpeed: 100, // in percent
      playPitch: 0, // in semi-tone unit (real value)
      playPitchSemi: 0, // in semi-tone (integer part)
      playPitchCents: 0, // percent for one semitone
      playVolume: 75, // in percent
      startButtonStr: m.loadFile, 
      loopButtonStr: m.loopAB,
      saveButtonStr: m.exportWav
    }

    this.setState = this.setState.bind(this)
    this.handleWindowClose = this.handleWindowClose.bind(this)
    this.loadFile = this.loadFile.bind(this)
    this.handleSpeedSlider = this.handleSpeedSlider.bind(this)
    this.handlePitchSlider = this.handlePitchSlider.bind(this)
    this.handleTimeSlider = this.handleTimeSlider.bind(this)
    this.handleVolumeSlider = this.handleVolumeSlider.bind(this)
    this.handlePlay = this.handlePlay.bind(this);
    this.handleLoop = this.handleLoop.bind(this);
    this.playAB = this.playAB.bind(this);
		this.handleToggleLoop = this.handleToggleLoop.bind(this);
	this.handleTimeASliderChange = this.handleTimeASliderChange.bind(this);
	this.handleTimeBSliderChange = this.handleTimeBSliderChange.bind(this);
    
  } // end constructor
  formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }



  handleWindowClose(event) { 
    if (shifter) { shifter.disconnect(); shifter.off(); shifter = null; 
      gainNode.disconnect(); }
    audioCtx.close();
  }

  componentDidMount () { // after render()
    // Safe to access window object here
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new window.AudioContext()
    gainNode = audioCtx.createGain()
    window.addEventListener('beforeClosing', this.handleWindowClose)
		console.log(this.props.mp3);
		this.loadFile();
  }

  componentWillUnmount () { // before closing app
    window.removeEventListener('beforeClosing', this.handleWindowClose)
  }
	
	handleToggleLoop = () => {
  const newLoopStatus = !this.params.loop;
  this.params.loop = newLoopStatus;
	
	if (!this.params.loop) {
	  const newTimeB = this.params.audioBuffer.duration;	
		this.setState({ timeB: newTimeB }, () => {
			if (this.params.isPlaying) {
					this.playAB(this.state.playingAt, this.state.timeB);
				}
			});

	}

  // Additional logic here if needed, e.g., to stop the loop
}

  render() {
    const {handleSpeedSlider, handlePitchSlider, 
           handleTimeSlider, handlePlay, 
           handleLoop} = this;
    const {playingAt, playingAtSlider, timeA, timeB,
           playSpeed, playPitch, playPitchSemi, playPitchCents,
           loopButtonStr, startButtonStr} 
           = this.state

    let duration = 0;
    if (this.params.audioBuffer)
       duration = this.params.audioBuffer.duration

    let startBStyle; 
    if (startButtonStr === m.pause)
      startBStyle = {color: 'green'};
    else  
      startBStyle = {};

    let loopBStyle; 
    if (loopButtonStr === m.stopLoop)
      loopBStyle = {color: 'green'};
    else  
      loopBStyle = {};

    let hrBlue = {border: '1px dotted', color: 'blue'};

    return (
      <div className={styles.App}>
			 	<div className={styles.slowDownerRow}>
          <h3>Speed</h3>
			    <center>
            <input type='range' name='speedSlider' min='25' max='200' value = {playSpeed} onChange={handleSpeedSlider} />
			 	  </center>
					<label>{playSpeed}%</label>
				</div>
				<div className={styles.slowDownerRow}>
			  	<h3>Pitch</h3>
          <center>
            <input type='range' name='pitchSliderCents' min='-100' max='100' value = {playPitchCents} onChange={handlePitchSlider} />
					</center>
				  <label>{parseFloat(playPitch).toFixed(2)}</label>
        </div>
				<div className={styles.slowDownerRow}>
					<h3>Start</h3>
					<center>
						<input
							type="range"
							id="timeASlider"
							name="timeASlider"
							min="0"
							max={this.params.audioBuffer ? this.params.audioBuffer.duration : 100} // Assuming 100 as a fallback max
							value={this.state.timeA}
							onChange={this.handleTimeASliderChange} 
						/>
					</center>
					<label>{this.formatTime(timeA)}</label>
					<button name='setA' onClick={handleLoop} >{m.setA}</button>
				</div>
 				<div className={styles.slowDownerRow}>
					<h3>End</h3>
					<center>
						<input
							type="range"
							id="timeBSlider"
							name="timeBSlider"
							min="0"
							max={this.params.audioBuffer ? this.params.audioBuffer.duration : 100} // Assuming 100 as a fallback max
							value={this.state.timeB}
							onChange={this.handleTimeBSliderChange} 
						/>
					</center>
					<label>{this.formatTime(timeB)}</label>
					<button name='setB' onClick={handleLoop} >{m.setB}</button>
				</div>
				<div className={styles.slowDownerRow}>
				<label className={styles.mainPlaybackLabel}>
				  {this.formatTime(playingAt)}
				</label>
				<center>
          <input 
						type='range' 
						name='timeSlider'
            min='0' max={duration}
            value = {playingAtSlider} step='1'
            onChange={handleTimeSlider} 
				/>
				</center>
				<label className={styles.mainPlaybackLabel}>
					{this.formatTime(timeB)}
				</label>
			</div>
      <span>
        2A) 
				<button name='Rewind' onClick={handleLoop}>
					<RewindIcon />
        </button>
				<button name='startPause' onClick={handlePlay}> 
          {!this.params.isPlaying ? <PlayIcon /> : <PauseIcon />}
        </button>
        <hr style={hrBlue}/>
        2B) 
				<button name='LoopAB' onClick={this.handleToggleLoop}>
				 <LoopIcon strokeColor={this.params.loop ? '#17bdce' : 'black'} />
				</button>
        <hr />
      </span>
      </div>
    ) // end return

  } // end render()

///////////////////////////////////////////////////

async loadFile() {
  if (this.params.isPlaying) return;

  this.setState({ totalTime: 0, startButtonStr: m.playOnce });
  this.params.filename = '/test.mp3';

  try {
    const response = await fetch(this.props.mp3); // Path to the file in the public directory
    const arrayBuffer = await response.arrayBuffer();

    // Close existing audio context if any
    if (audioCtx) audioCtx.close();

    // Create new audio context and gain node
    audioCtx = new window.AudioContext();
    gainNode = audioCtx.createGain();

    // Decode the audio data
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    this.params.audioBuffer = audioBuffer;
    this.setState({ startButtonStr: m.playOnce, playingAt: 0, playingAtSlider: 0, timeA: 0, timeB: audioBuffer.duration });
  } catch (error) {
    console.error("Error loading file:", error);
  }
}

// UI handlers
  handleSpeedSlider(event) { 
     // console.log('handleSpeedSlider');

     if (event.target.name === 'speedSlider') {
       if (shifter) shifter.tempo = event.target.value/100.0
       this.setState({playSpeed: event.target.value})
       return;
     }

     if (event.target.name === 'reset') {
       if (shifter) shifter.tempo = 1;
       this.setState({playSpeed: 100})
       return;
     }

  }
	handleTimeASliderChange = (event) => {
  const newTimeA = parseFloat(event.target.value);
  this.params.timeA = newTimeA; // Update the parameter
  
  // Optionally, update the state if you want to trigger a re-render or have the UI reflect this change
  this.setState({ timeA: newTimeA });
};
handleTimeBSliderChange = (event) => {
  const newTimeB = parseFloat(event.target.value);
  this.params.timeB = newTimeB; // Update the parameter
  
  // Optionally, update the state to reflect the change in the UI and potentially re-render
  this.setState({ timeB: newTimeB });
};

  handlePitchSlider(event) { 

     let pitchSemi = 0;

     if (event.target.name === 'pitchSliderSemi' ){
       pitchSemi = parseFloat(event.target.value) 
           + parseFloat(this.state.playPitchCents)/100.0;
       this.setState({playPitchSemi: event.target.value})
     } else if (event.target.name === 'pitchSliderCents' ){
       pitchSemi = parseFloat(this.state.playPitchSemi)
           + parseFloat(event.target.value)/100.0
       this.setState({playPitchCents: event.target.value})
     } else if (event.target.name === 'reset') {
       this.setState({playPitchSemi: 0, playPitchCents: 0});
       pitchSemi = 0;
     }

     if (shifter) {shifter.pitch = Math.pow(2.0, pitchSemi/12.0);}
     this.setState({playPitch: pitchSemi});

     return;
  }

  handleTimeSlider(event) { 

     if (event.target.name !== 'timeSlider') return

     if (this.state.startButtonStr === m.playOnce) {
        let value = event.target.value;
        this.setState({playingAt: parseFloat(value)});
        this.setState({playingAtSlider: value});
     }
  }

  handleVolumeSlider(event) { 
     if (event.target.name !== 'volumeSlider') return

     let vol = event.target.value*1.0
     gainNode.gain.value = vol/100.0
     this.setState({playVolume: vol})
  }

  handlePlay(event) { 
     const {audioBuffer} = this.params;

// startPause or LoopAB
   if (event.target.name === 'startPause') { 
     if (audioCtx.state === 'suspended') audioCtx.resume()

     let timeA, timeB; 

// Pause
     if (this.params.isPlaying) {
       if (shifter === null) return

       shifter.disconnect(); shifter.off(); shifter = null;
       gainNode.disconnect();
       this.params.isPlaying = false;
       this.setState({playingAtSlider: this.state.playingAt});
       this.setState({startButtonStr: m.playOnce})

       return;
     } // end pause 

// PlayOnce

     if (!this.params.isPlaying) {

			let startTime = (this.state.playingAt >= this.state.timeA && this.state.playingAt <= this.state.timeB) ? this.state.playingAt : this.state.timeA;

       this.playAB(startTime, this.state.timeB); // timeA, timeB
       return;
     }

   } // END  if (event.target.name)

    return;
  } // end handlePlay()

  handleLoop(event) {
    if (event.currentTarget.name == 'Rewind') {
			if(this.params.isPlaying) {
				shifter.disconnect(); shifter.off(); shifter = null;
				gainNode.disconnect();
				this.params.isPlaying = false;
				this.setState({playingAtSlider: this.state.playingAt});
				this.playAB(this.state.timeA, this.state.timeB);
			}
      this.setState ({playingAt: this.state.timeA});
      this.setState ({playingAtSlider: this.state.timeA});

      return;
    }

		if (event.target.name === 'setA') {
			this.setState({ timeA: this.state.playingAt });
			return;
		}

		if (event.target.name === 'setB') {
			const newTimeB = this.state.playingAt >= this.state.timeA
				? parseFloat(this.state.playingAt)
				: parseFloat(this.state.timeA) + 10;

			this.setState({ timeB: newTimeB }, () => {
				if (this.params.isPlaying) {
					// The playAB function is now called with the updated state values
					this.playAB(this.state.timeA, this.state.timeB);
				}
				this.setState({ loopButtonStr: m.stopLoop, startButtonStr: m.playOnce });
				this.params.loop = true;
			});
		}

    if (event.target.name === 'LoopAB'){
      if (!this.params.audioBuffer) return;

		if (!this.params.loop) {
			this.params.loop = true;

			let startTime = this.state.playingAt >= this.state.timeA && this.state.playingAt <= this.state.timeB
											? this.state.playingAt
											: this.state.timeA;

			this.playAB(startTime, this.state.timeB);
			this.setState({ loopButtonStr: m.stopLoop, startButtonStr: m.playOnce });

		} else {
			if (!this.params.isPlaying) return;

			if (shifter) {
				shifter.disconnect(); shifter.off(); shifter = null;
				gainNode.disconnect();
			}

			this.params.isPlaying = false;
			this.params.loop = false;
			this.setState({playingAtSlider: this.state.playingAt, loopButtonStr: m.loopAB});
		}

		return;
	}
// reset AB
    if (event.target.name === 'resetAB') {
      if (this.params.audioBuffer === null) return;
      this.setState ({timeA: 0, timeB: this.params.audioBuffer.duration});

    return;
   } // end resetAB

  } // END handleLoop


  playAB(timeA, timeB) {

     if (this.params.audioBuffer === null) return;

     if (audioCtx.state === 'suspended') audioCtx.resume()

     if (timeB <= timeA){
       timeB = timeA + 5; // min 5 sec
       this.setState({timeB: timeB});
     }

     const {audioBuffer, loopInterval} = this.params;

     const from = timeA*audioBuffer.sampleRate;
     const to = timeB*audioBuffer.sampleRate;
     let offset = 0;

     let partialAudioBuffer = audioCtx.createBuffer(2,
          to - from + offset, audioBuffer.sampleRate);
     let left  = audioBuffer.getChannelData(0);
     let right = audioBuffer.getChannelData(0);

     left  = left.subarray(from, to);
     let tmp = partialAudioBuffer.getChannelData(0);

     for (let sample=0; sample < left.length; sample++) 
        tmp[sample + offset] = left[sample];

     if (audioBuffer.numberOfChannels >= 2) {
       tmp = partialAudioBuffer.getChannelData(1);
       right = right.subarray(from, to);

       for (let sample=0; sample < right.length; sample++) 
         tmp[sample + offset] = right[sample];
     }
     tmp = null; 

// create PitchShifter and Play
     let bufferSize = 16384;
     if (shifter) { shifter.disconnect(); shifter.off(); shifter= null;}
     shifter = new PitchShifter(audioCtx, partialAudioBuffer, bufferSize)
     partialAudioBuffer = null
     shifter.tempo = this.state.playSpeed/100.0
     shifter.pitch = Math.pow(2.0,this.state.playPitch/12.0)

     let duration = shifter.formattedDuration;

     shifter.on('play', detail => {

       let currentPos =  parseFloat(timeA) + parseFloat(detail.timePlayed);
       if (this.params.loop) currentPos -= loopInterval;

       this.setState({playingAt: currentPos, playingAtSlider: currentPos}); 

       if (detail.formattedTimePlayed >= duration) {
         shifter.off(); shifter.disconnect(); shifter = null;
         gainNode.disconnect();

         this.params.isPlaying = false;
         if (this.state.startButtonStr === m.pause)
           this.setState ({playingAt: 0, playingAtSlider: 0,
             startButtonStr: m.playOnce}); 

         if (this.params.loop)
           this.playAB(this.state.timeA, this.state.timeB);
         return;
       }

     }); // end shifter.on
 
    shifter.connect(gainNode);
    gainNode.connect(audioCtx.destination); // start play

    this.params.isPlaying = true; 
    if (!this.params.loop)
      this.setState({startButtonStr: m.pause});

    return;
  } // END playAB()

 
} // end class

export default SlowDowner;


