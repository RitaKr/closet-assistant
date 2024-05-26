//import slideBg from '../assets/slider';
import { useRef } from "react";
export default function Header() {
	let bgCounter = 4;
	let count = 1;

	const header = useRef(null);
	const bg = useRef(null);

	let lastClick = 0;
	var xDown = null; //x touch coordinate for mobile scrolling

	function slide(type, count, rightDirection) {
        if (header.current) {
		animation("center", `calc(50% ${rightDirection ? "-" : "+"} 150px)`);
		setTimeout(() => {
			count = changeBg(type, count);
			changeOpacityForAll(count);

			animation(`calc(50% ${rightDirection ? "+" : "-"} 150px)`, "center");
		}, 140);
    }
	}

	function changeBg(type, i) {
		//console.log(count)
		count += i;
		//console.log(count)
		if (count > bgCounter) count = 1;
		if (count < 1) count = bgCounter;

		const imageUrl = `${process.env.PUBLIC_URL}/images/headers/bg${count}.${type}`;
		//console.log(imageUrl)
		bg.current.style.backgroundImage = `url(${imageUrl})`;

		return count;
	}

	function changeOpacityForAll(count) {
		document.querySelectorAll(".c").forEach((item) => {
			item.style.opacity = "0.4";
		});
		document.querySelector(`#c${count}`).style.opacity = "1";
	}

	//handling mobile scrolling
	function getTouches(e) {
		return e.touches || e.originalEvent.touches;
	}

	function handleTouchStart(e) {
		const firstTouch = getTouches(e)[0];
		xDown = firstTouch.clientX;
	}

	function handleTouchMove(e) {
		if (!xDown) {
			return;
		}

		var xUp = e.touches[0].clientX;
		var xDiff = xDown - xUp;

		//sliding left
		if (xDiff > 0) {
			slide("jpg", 1, true);
		} else {
			//sliding right (backwards)
			slide("jpg", -1, false);
		}

		xDown = null;
	}

	function animation(start, fin) {
		if (bg.current) {
			bg.current.animate(
				[{ backgroundPositionX: start }, { backgroundPositionX: fin }],
				{
					// timing options
					duration: 200,
					iterations: 1,
				}
			);
		}
	}

	function handleBGChange(e) {
		let i = parseInt(e.target.dataset.i);
		//console.log('e.target', e.target)
		console.log("i", i, "lastClick", lastClick);
		if (lastClick > i) {
			slide("jpg", i + 1 - count, false);
		} else if (lastClick < i) {
			slide("jpg", i + 1 - count, true);
		}
		lastClick = i;
	}

	// useEffect(() => {
	// 	if (header.current) {
	// 		setInterval(function () {
	// 			slide("jpg", 1, true);
	// 		}, 10000);
	// 	}
	// },[]);

	return (
		<header
			className="page-header"
			ref={header}
			onTouchStart={handleTouchStart}
			onTouchMove={handleTouchMove}
		>
			<div ref={bg} className="background"></div>
			<div className="header-content">
				<h2>WELCOME TO</h2>
				<h1>CLOSET ASSISTANT</h1>
			</div>
			<div className="control">
				<div
					id="c1"
					className="c"
					name="1"
					data-i={0}
					onClick={handleBGChange}
				></div>
				<div
					id="c2"
					className="c"
					name="2"
					data-i={1}
					onClick={handleBGChange}
				></div>
				<div
					id="c3"
					className="c"
					name="3"
					data-i={2}
					onClick={handleBGChange}
				></div>
				<div
					id="c4"
					className="c"
					name="4"
					data-i={3}
					onClick={handleBGChange}
				></div>
			</div>
		</header>
	);
}
