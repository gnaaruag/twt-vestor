import Link from "next/link"
export default function Footer() {
	return (
		<div className="flex justify-center items-center gap-2 p-4 bg-gray-100">
			<ul className="flex  items-center justify-center gap-4">
				<li>
				Made w ❤︎ by <Link href={"https://x.com/gnaaruag"} target="_blank">gaurang</Link>
				</li>
				<li>pss check my <Link href="https://gnaaruag.tech" target="_blank">website</Link> out</li>
			</ul>
			
		</div>
	)
}