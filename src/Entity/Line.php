<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\UuidInterface;

class Line
{
    /**
     * @var UuidInterface
     *
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="NONE")
     * @ORM\Column(type="uuid", unique=true)
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=30)
     */
    private $name;

    /**
     * @var Collection|Connection[]
     *
     * @ORM\ManyToMany(targetEntity="Connection")
     */
    private $connections;

    public function __construct(UuidInterface $id, string $name)
    {
        $this->id = $id;
        $this->name = $name;
        $this->connections = new ArrayCollection();
    }

    public function name(): string
    {
        return $this->name;
    }

    public function changeName(string $name): void
    {
        $this->name = $name;
    }

    /**
     * @return array|Connection[]
     */
    public function connections(): array
    {
        return $this->connections->toArray();
    }

    public function addConnection(Connection $connection): void
    {
        /** @var Connection|null $last */
        $last = $this->connections->last();
        $from = $connection->from()->location();
        if ($last && !$last->to()->isLocatedAt($from)) {
            throw new \LogicException('Start position of new connection must be equal end postition of last one');
        }
        $this->connections->add($connection);
    }

    public function clearConnections(): void
    {
        $this->connections->clear();
    }
}