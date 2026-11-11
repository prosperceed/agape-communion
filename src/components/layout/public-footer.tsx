import Link from "next/link";
import Image from "next/image";
import {
	MapPinIcon,
	PhoneIcon,
	EnvelopeIcon,
	ClockIcon,
} from "@heroicons/react/24/outline";
import type { ChurchSettingsData } from "@/features/pages/queries";

interface PublicFooterProps {
	settings: ChurchSettingsData;
}

export function PublicFooter({ settings }: PublicFooterProps) {
	const year = new Date().getFullYear();

	return (
		<footer className="bg-[#0B1325] text-slate-300 border-t border-white/10">
			<div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
					<div className="space-y-4">
						<Link href="/" className="flex items-center gap-2.5">
							<Image
								src="/assets/branding/logo-light.svg"
								alt={`${settings.churchName} Logo`}
								width={32}
								height={32}
								className="h-8 w-8"
							/>
							<span className="text-base font-bold uppercase tracking-wider text-white">
								{settings.churchName}
							</span>
						</Link>

						<div className="flex items-center gap-4 pt-2 text-xs font-medium text-slate-400">
							{settings.youtubeUrl && (
								<a
									href={settings.youtubeUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="hover:text-[#F97316] transition-colors"
								>
									YouTube
								</a>
							)}
							{settings.facebookUrl && (
								<a
									href={settings.facebookUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="hover:text-[#F97316] transition-colors"
								>
									Facebook
								</a>
							)}
							{settings.instagramUrl && (
								<a
									href={settings.instagramUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="hover:text-[#F97316] transition-colors"
								>
									Instagram
								</a>
							)}
						</div>
					</div>

					<div>
						<h3 className="text-xs font-semibold uppercase tracking-widest text-white mb-4">
							Quick Links
						</h3>
						<ul className="space-y-2.5 text-sm">
							<li>
								<Link
									href="/about"
									className="hover:text-white transition-colors"
								>
									About Our Church
								</Link>
							</li>
							<li>
								<Link
									href="/services"
									className="hover:text-white transition-colors"
								>
									Our Services & Programmes
								</Link>
							</li>
							<li>
								<Link
									href="/messages"
									className="hover:text-white transition-colors"
								>
									Sermons & Messages
								</Link>
							</li>
							<li>
								<Link
									href="/livestream"
									className="hover:text-white transition-colors"
								>
									Sunday Livestream
								</Link>
							</li>
							<li>
								<Link
									href="/testimonies"
									className="hover:text-white transition-colors"
								>
									Testimonies
								</Link>
							</li>
						</ul>
					</div>

					<div>
						<h3 className="text-xs font-semibold uppercase tracking-widest text-white mb-4">
							Resources
						</h3>
						<ul className="space-y-2.5 text-sm">
							<li>
								<Link
									href="/devotionals"
									className="hover:text-white transition-colors"
								>
									Daily Devotionals
								</Link>
							</li>
							<li>
								<Link
									href="/blog"
									className="hover:text-white transition-colors"
								>
									Church Blog
								</Link>
							</li>
							<li>
								<Link
									href="/contact"
									className="hover:text-white transition-colors"
								>
									Contact & Prayer Requests
								</Link>
							</li>
						</ul>
					</div>

					<div>
						<h3 className="text-xs font-semibold uppercase tracking-widest text-white mb-4">
							Visit & Contact
						</h3>
						<ul className="space-y-3 text-sm text-slate-400">
							<li className="flex items-start gap-2.5">
								<MapPinIcon className="h-5 w-5 shrink-0 text-[#EA580C] mt-0.5" />
								<span>{settings.address}</span>
							</li>
							<li className="flex items-center gap-2.5">
								<PhoneIcon className="h-4 w-4 shrink-0 text-[#EA580C]" />
								<span>{settings.phone}</span>
							</li>
							<li className="flex items-center gap-2.5">
								<EnvelopeIcon className="h-4 w-4 shrink-0 text-[#EA580C]" />
								<span>{settings.email}</span>
							</li>
							<li className="flex items-start gap-2.5">
								<ClockIcon className="h-5 w-5 shrink-0 text-[#EA580C] mt-0.5" />
								<span>{settings.livestreamDefaultSchedule}</span>
							</li>
						</ul>
					</div>
				</div>

				<div className="mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-white/10 pt-8 text-xs text-slate-400 gap-4">
					<p>
						&copy; {year} {settings.churchName}. All rights reserved.
					</p>
					<div className="flex items-center gap-6">
						{/* <Link href="/contact" className="hover:text-white">
							Contact Us
						</Link> */}
					</div>
				</div>
			</div>
		</footer>
	);
}
