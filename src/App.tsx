import { useState } from "react";
import { useRaffle } from "./features/raffle/application/useRaffle";
import { ItemsPanel } from "./features/raffle/ui/ItemsPanel";
import { ParticipantsPanel } from "./features/raffle/ui/ParticipantsPanel";
import { PresentationStage } from "./features/raffle/ui/PresentationStage";
import { RouletteWheel } from "./features/raffle/ui/RouletteWheel";
import { WinnerAnnouncement } from "./features/raffle/ui/WinnerAnnouncement";
import { WinnersPanel } from "./features/raffle/ui/WinnersPanel";
import { useRoster } from "./features/roster/application/useRoster";
import { RosterDialog } from "./features/roster/ui/RosterDialog";
import { useBackgroundMusic } from "./shared/lib/useBackgroundMusic";
import { Button } from "./shared/ui/Button";

const phaseHint = {
  empty: "Cargá items e integrantes para armar el sorteo.",
  ready: "Tocá la ruleta para girar. Un giro, un item, un ganador.",
  spinning: "La ruleta está girando...",
  revealing: "¡Pagado!",
  finished: "Reparto terminado.",
} as const;

interface AppProps {
  readonly onLogOut?: () => void;
}

export const App = ({ onLogOut }: AppProps = {}) => {
  const { state, phase, canSpin, nextItem, actions } = useRaffle();
  const { roster, presentNames, actions: rosterActions } = useRoster();
  const [rosterOpen, setRosterOpen] = useState(false);
  const [onStage, setOnStage] = useState(false);
  const { musicOn, toggleMusic } = useBackgroundMusic();
  const locked = state.status !== "idle";

  return (
    <div className="mx-auto flex min-h-dvh max-w-[1500px] flex-col gap-4 px-4 py-5 lg:px-6">
      {/*
        En el escenario el layout normal se DESMONTA, no se esconde: si sólo
        lo tapara, sus botones seguirían navegables con Tab y visibles para
        un lector de pantalla. Dos ruedas en el árbol es una de más.
      */}
      {!onStage && (
        <>
          <header className="flex flex-wrap items-end justify-between gap-3 border-b border-steel/60 pb-3">
            <div>
              {/*
            El logo va con alt vacío a propósito: "Black Templars" ya está
            escrito en el subtítulo, y repetirlo en el alt haría que un lector
            de pantalla lo lea dos veces.
          */}
              <h1 className="flex flex-col items-start gap-1.5">
                <img
                  src="/clan-logo.png"
                  width={80}
                  height={40}
                  alt=""
                  className="animate-crest h-10 w-auto"
                />
                <span className="title-sheen font-display text-xl leading-none font-bold tracking-[0.16em] uppercase sm:text-2xl">
                  Black Templars
                </span>
              </h1>
              {/* Las cruces son adorno: un lector de pantalla lee sólo el lema. */}
              <p className="mt-1.5 flex items-center gap-1.5 text-xs tracking-wide text-ash italic">
                <span
                  aria-hidden="true"
                  className="text-sm not-italic text-crimson"
                >
                  ✠
                </span>
                El miedo No cruza este estandarte
                <span
                  aria-hidden="true"
                  className="text-sm not-italic text-crimson"
                >
                  ✠
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <p className="hidden text-right text-[0.6875rem] leading-tight text-ash/60 sm:block">
                Azar criptográfico, sin sesgo.
                <br />
                Nadie gana dos veces.
              </p>
              <Button
                variant="primary"
                disabled={phase !== "ready"}
                onClick={() => setOnStage(true)}
                title="Agranda la ruleta y esconde los paneles, para transmitir"
              >
                Presentación
              </Button>
              <Button onClick={() => setRosterOpen(true)} disabled={locked}>
                Roster ({roster.length})
              </Button>
              <Button
                onClick={toggleMusic}
                aria-pressed={musicOn}
                title={
                  musicOn
                    ? "Apagar la música de fondo"
                    : "Encender la música de fondo"
                }
              >
                {musicOn ? "♪ Música" : "Sin música"}
              </Button>
              {onLogOut && (
                <Button
                  onClick={onLogOut}
                  title="Cerrar sesión y volver al login"
                >
                  Salir
                </Button>
              )}
              <Button
                variant="danger"
                disabled={locked}
                onClick={() => {
                  if (
                    globalThis.confirm(
                      "¿Borrar items, integrantes y ganadores?",
                    )
                  )
                    actions.reset();
                }}
              >
                Reiniciar
              </Button>
            </div>
          </header>

          <main className="grid flex-1 grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(240px,1fr)_minmax(340px,1.4fr)_minmax(260px,1fr)]">
            {/* Por un lado los items, por otro los integrantes. */}
            <div className="flex min-h-0 flex-col gap-4 lg:h-[calc(100dvh-9rem)]">
              <ItemsPanel
                items={state.items}
                locked={locked}
                onAdd={actions.addItems}
                onRemove={actions.removeItem}
              />
              <ParticipantsPanel
                participants={state.participants}
                locked={locked}
                onAdd={actions.addParticipants}
                onRemove={actions.removeParticipant}
              />
            </div>

            {/* El escenario */}
            <section className="flex flex-col items-center gap-4 rounded-sm border border-steel/60 bg-abyss/75 px-4 py-6 backdrop-blur-md">
              <div className="text-center">
                <p className="font-mono text-[0.625rem] tracking-[0.22em] text-ash/60 uppercase">
                  {nextItem ? "Se juega" : "Nada en juego"}
                </p>
                <div className="mt-1.5 flex min-h-8 items-center justify-center">
                  {nextItem ? (
                    <span className="font-display text-base font-bold text-parchment sm:text-lg">
                      {nextItem.name}
                    </span>
                  ) : (
                    <span className="text-sm text-ash/50">—</span>
                  )}
                </div>
              </div>

              <RouletteWheel
                participants={state.participants}
                phase={phase}
                spotlight={state.spotlight}
                canSpin={canSpin}
                onSpin={actions.spin}
              />

              <p className="min-h-4 text-center text-xs text-ash/70">
                {phaseHint[phase]}
              </p>
            </section>

            {/* Y a la derecha, los ganadores. Debajo, el líder mirando el reparto. */}
            <div className="flex min-h-0 flex-col gap-3 lg:h-[calc(100dvh-9rem)]">
              <WinnersPanel
                winners={state.winners}
                locked={locked}
                onReturnToPool={actions.returnToPool}
              />
              {/*
            Ocupa lo que sobre: con pocos ganadores se ve entero, y cuando la
            lista crece se achica sola en vez de empujarla fuera de pantalla.
          */}
              <div className="flex min-h-0 flex-1 items-end justify-center">
                <img
                  src="/clan-leader.png"
                  width={282}
                  height={388}
                  alt="EIUltimoSamurai, líder del clan"
                  className="leader-cutout animate-bob pointer-events-none max-h-64 w-auto select-none lg:max-h-full"
                />
              </div>
            </div>
          </main>
        </>
      )}

      {rosterOpen && (
        <RosterDialog
          roster={roster}
          presentNames={presentNames}
          locked={locked}
          onAdd={rosterActions.add}
          onRemove={rosterActions.remove}
          onToggle={rosterActions.toggle}
          onMarkAll={rosterActions.markAll}
          onLoadPool={() => {
            actions.addParticipants(presentNames.join("\n"));
            setRosterOpen(false);
          }}
          onClose={() => setRosterOpen(false)}
        />
      )}

      {/*
        El escenario tapa la app entera: cuando se transmite, los paneles de
        carga son ruido para las cuarenta personas que están mirando.
      */}
      {onStage && (
        <PresentationStage
          participants={state.participants}
          winners={state.winners}
          nextItem={nextItem}
          remaining={state.items.length}
          phase={phase}
          spotlight={state.spotlight}
          canSpin={canSpin}
          onSpin={actions.spin}
          onExit={() => setOnStage(false)}
        />
      )}

      {/*
        El anuncio tapa todo a propósito, incluso al escenario: cuando se
        paga un item, eso es lo único que importa en la pantalla.
      */}
      {phase === "revealing" && state.spotlight && (
        <WinnerAnnouncement
          winner={state.spotlight}
          nextItem={nextItem}
          onContinue={actions.ack}
        />
      )}
    </div>
  );
};
